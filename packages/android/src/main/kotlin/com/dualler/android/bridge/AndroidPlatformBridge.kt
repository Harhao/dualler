package com.dualler.android.bridge

import android.content.Context
import android.os.Handler
import android.os.Looper
import android.webkit.WebMessagePort
import com.dualler.android.api.*
import com.dualler.core.Router
import com.dualler.platform.APIHandler
import com.dualler.platform.JSEngine
import com.dualler.platform.PlatformBridge
import com.dualler.platform.WebViewProvider
import com.dualler.platform.model.APIResult
import com.dualler.platform.model.DOMEvent
import com.dualler.platform.model.JSArray
import com.dualler.platform.model.JSValue
import kotlinx.serialization.json.Json
import kotlinx.serialization.encodeToString

/**
 * Android implementation of [PlatformBridge].
 *
 * Coordinates communication between the logic layer (JSEngine), render layer (WebView),
 * and native layer (API handlers).
 *
 * Uses WebMessagePort for efficient WebView communication and JSEngine for logic-layer callbacks.
 */
class AndroidPlatformBridge(private val context: Context) : PlatformBridge {
    private val apiHandlers = mutableMapOf<String, APIHandler>()
    private val json = Json { ignoreUnknownKeys = true }
    private val mainHandler = Handler(Looper.getMainLooper())

    // Message ports for WebView communication
    private var webViewPort: WebMessagePort? = null
    private var jsEngine: JSEngine? = null
    private var webView: WebViewProvider? = null

    init {
        // Register system APIs
        registerAPI("request", NetworkAPIHandler(context))
        registerAPI("getStorage", StorageGetAPIHandler(context))
        registerAPI("setStorage", StorageSetAPIHandler(context))
        registerAPI("removeStorage", StorageRemoveAPIHandler(context))
        registerAPI("getSystemInfo", DeviceInfoAPIHandler(context))
        registerAPI("getNetworkType", NetworkTypeAPIHandler(context))
        registerAPI("showToast", ToastAPIHandler(context))
        registerAPI("showModal", ModalAPIHandler(context))
        registerAPI("vibrate", VibrateAPIHandler(context))
    }

    /**
     * Register navigation APIs (requires Router instance).
     * Call this after the Router is created.
     */
    fun registerNavigationAPIs(router: Router) {
        registerAPI("navigateTo", NavigateToHandler(router))
        registerAPI("navigateBack", NavigateBackHandler(router))
        registerAPI("redirectTo", RedirectToHandler(router))
        registerAPI("reLaunch", ReLaunchHandler(router))
    }

    /**
     * Connect a WebView provider and set up WebMessagePort for bidirectional communication.
     * Should be called after the WebView is loaded and ready.
     */
    fun connectWebView(webViewProvider: WebViewProvider) {
        this.webView = webViewProvider

        if (webViewProvider is com.dualler.android.webview.AndroidWebViewProvider) {
            val androidWebView = webViewProvider.getWebView()
            mainHandler.post {
                val channel = androidWebView.createWebMessageChannel()
                val portPair = channel

                // Port 0 stays in native, port 1 is sent to the WebView
                this.webViewPort = portPair[0]

                // Set up the native-side port to receive messages from WebView
                portPair[0].setWebMessageCallback(object : WebMessagePort.WebMessageCallback() {
                    override fun onMessage(port: WebMessagePort, message: android.webkit.WebMessage) {
                        val data = message.data ?: return
                        handleWebViewMessage(data)
                    }
                })

                // Send port 1 to the WebView so it can use it for communication
                androidWebView.postWebMessage(
                    android.webkit.WebMessage("", arrayOf(portPair[1])),
                    android.net.Uri.parse("https://dualler.local")
                )
            }
        }
    }

    /**
     * Connect the JS Engine for logic-layer communication.
     */
    fun connectJSEngine(engine: JSEngine) {
        this.jsEngine = engine

        // Register the native callback receiver in the JS engine.
        // This callback exists as a JS-callable entry point; actual callback routing
        // is handled by invokeCallback which calls into JS directly.
        engine.registerCallback("__duallerNativeCallback__") { _ -> JSValue.Null }
    }

    override fun setData(pageId: String, data: Map<String, Any>) {
        val message = json.encodeToString(kotlinx.serialization.json.JsonObject(
            data.mapValues { (_, v) ->
                kotlinx.serialization.json.JsonPrimitive(v.toString())
            }
        ))

        // Send to WebView render layer via WebMessagePort
        val port = webViewPort
        if (port != null) {
            mainHandler.post {
                port.postMessage(android.webkit.WebMessage(
                    """{"type":"setData","pageId":"$pageId","data":$message}"""
                ))
            }
        } else {
            // Fallback: send via evaluateJavascript
            (webView as? com.dualler.android.webview.AndroidWebViewProvider)?.evaluateJavascript(
                "window.__dualler_render__ && window.__dualler_render__.patch('$pageId', $message)"
            )
        }
    }

    override fun dispatchEvent(pageId: String, event: DOMEvent) {
        val eventJson = json.encodeToString(event)

        // Send to JSEngine logic layer
        val engine = jsEngine
        if (engine != null) {
            try {
                engine.evaluateScript(
                    "typeof __duallerEventHandler__ === 'function' && __duallerEventHandler__('$pageId', $eventJson)",
                    "dualler://event"
                )
            } catch (e: Exception) {
                // Engine may not be ready yet
            }
        }
    }

    override fun callNative(api: String, params: Map<String, Any>, callbackId: String) {
        val handler = apiHandlers[api]
        if (handler == null) {
            invokeCallback(callbackId, APIResult.Fail(-1, "Unknown API: $api"))
            return
        }
        handler.invoke(params) { result -> invokeCallback(callbackId, result) }
    }

    override fun invokeCallback(callbackId: String, result: APIResult) {
        val engine = jsEngine
        if (engine != null) {
            val resultJson = when (result) {
                is APIResult.Success -> {
                    val dataJson = when (val d = result.data) {
                        is Map<*, *> -> json.encodeToString(
                            kotlinx.serialization.json.JsonObject(
                                d.entries.associate { (k, v) ->
                                    k.toString() to kotlinx.serialization.json.JsonPrimitive(v.toString())
                                }
                            )
                        )
                        else -> "\"${result.data}\""
                    }
                    """{"success":true,"data":$dataJson}"""
                }
                is APIResult.Fail -> """{"success":false,"errCode":${result.errCode},"errMsg":"${result.errMsg}"}"""
            }

            try {
                engine.evaluateScript(
                    "typeof __duallerCallback__ === 'function' && __duallerCallback__('$callbackId', $resultJson)",
                    "dualler://callback"
                )
            } catch (e: Exception) {
                // Engine may not be ready
            }
        }
    }

    override fun registerAPI(name: String, handler: APIHandler) {
        apiHandlers[name] = handler
    }

    /**
     * Handle messages received from the WebView via WebMessagePort.
     */
    private fun handleWebViewMessage(data: String) {
        try {
            val element = json.parseToJsonElement(data)
            val obj = element as? kotlinx.serialization.json.JsonObject ?: return
            val type = (obj["type"] as? kotlinx.serialization.json.JsonPrimitive)?.content

            when (type) {
                "callNative" -> {
                    val api = (obj["api"] as? kotlinx.serialization.json.JsonPrimitive)?.content ?: return
                    val callbackId = (obj["callbackId"] as? kotlinx.serialization.json.JsonPrimitive)?.content ?: ""
                    val paramsElement = obj["params"] as? kotlinx.serialization.json.JsonObject
                    val params = paramsElement?.entries?.associate { (k, v) ->
                        k to (v as? kotlinx.serialization.json.JsonPrimitive)?.content.orEmpty()
                    } as Map<String, Any>? ?: emptyMap()

                    callNative(api, params, callbackId)
                }
                "event" -> {
                    val pageId = (obj["pageId"] as? kotlinx.serialization.json.JsonPrimitive)?.content ?: return
                    val eventType = (obj["eventType"] as? kotlinx.serialization.json.JsonPrimitive)?.content ?: return
                    val target = (obj["target"] as? kotlinx.serialization.json.JsonPrimitive)?.content ?: ""
                    val event = DOMEvent(
                        type = eventType,
                        target = target,
                        currentTarget = target,
                        timestamp = System.currentTimeMillis()
                    )
                    dispatchEvent(pageId, event)
                }
            }
        } catch (e: Exception) {
            // Ignore malformed messages
        }
    }
}
