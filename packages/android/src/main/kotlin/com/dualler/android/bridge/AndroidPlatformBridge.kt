package com.dualler.android.bridge

import android.content.Context
import android.os.Handler
import android.os.Looper
import android.webkit.WebMessage
import android.webkit.WebMessagePort
import com.dualler.android.api.*
import com.dualler.android.webview.AndroidWebViewProvider
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
 * Communication priority:
 *   1. WebMessagePort (preferred, Android 6.0+) — dedicated channel, no JNI overhead
 *   2. JavascriptInterface (fallback) — postMessage + evaluateJavascript
 *
 * WebMessagePort provides:
 *   - Non-blocking bidirectional communication
 *   - No main thread blocking from JNI callbacks
 *   - Direct message passing without script injection
 */
class AndroidPlatformBridge(private val context: Context) : PlatformBridge {
    private val apiHandlers = mutableMapOf<String, APIHandler>()
    private val json = Json { ignoreUnknownKeys = true }
    private val mainHandler = Handler(Looper.getMainLooper())

    // Communication channels
    private var nativePort: WebMessagePort? = null
    private var jsEngine: JSEngine? = null
    private var webViewProvider: AndroidWebViewProvider? = null

    /** Whether WebMessagePort is connected */
    val isWebMessagePortConnected: Boolean get() = nativePort != null

    init {
        // Register default system APIs
        registerDefaultAPIs()
    }

    /**
     * Register default system APIs
     */
    private fun registerDefaultAPIs() {
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
     * Connect to a WebView and establish WebMessagePort channel.
     *
     * This should be called after the WebView is loaded and ready.
     * If WebMessagePort is not available (Android < 6.0), falls back to JavascriptInterface.
     */
    fun connectWebView(provider: WebViewProvider) {
        if (provider !is AndroidWebViewProvider) return
        this.webViewProvider = provider

        // Try to establish WebMessagePort connection
        provider.connectMessagePort { message ->
            handleWebViewMessage(message)
        }
    }

    /**
     * Connect the JS Engine for logic-layer communication.
     */
    fun connectJSEngine(engine: JSEngine) {
        this.jsEngine = engine

        // Register native callback receiver
        engine.registerCallback("__duallerNativeCallback__") { args ->
            // This is the entry point for JS -> Native calls
            JSValue.Null
        }
    }

    // MARK: - PlatformBridge Implementation

    override fun setData(pageId: String, data: Map<String, Any>) {
        val dataJson = serializeData(data)
        val message = """{"type":"setData","pageId":"$pageId","data":$dataJson}"""

        sendMessageToWebView(message)
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
        val engine = jsEngine ?: return

        val resultJson = when (result) {
            is APIResult.Success -> {
                val dataJson = serializeResultData(result.data)
                """{"success":true,"data":$dataJson}"""
            }
            is APIResult.Fail -> {
                """{"success":false,"errCode":${result.errCode},"errMsg":"${escapeJson(result.errMsg)}"}"""
            }
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

    override fun registerAPI(name: String, handler: APIHandler) {
        apiHandlers[name] = handler
    }

    // MARK: - Message Sending

    /**
     * Send a message to the WebView.
     *
     * Priority: WebMessagePort > JavascriptInterface fallback
     */
    private fun sendMessageToWebView(message: String) {
        val provider = webViewProvider
        if (provider != null && provider.isMessagePortConnected()) {
            // Use WebMessagePort (preferred)
            provider.postMessage(message)
        } else {
            // Fallback: evaluateJavascript
            provider?.evaluateJavascript(
                "typeof window.__duallerOnMessage__ === 'function' && window.__duallerOnMessage__('${escapeJsString(message)}')"
            )
        }
    }

    // MARK: - Message Handling

    /**
     * Handle messages received from the WebView.
     */
    private fun handleWebViewMessage(data: String) {
        try {
            val element = json.parseToJsonElement(data)
            val obj = element as? kotlinx.serialization.json.JsonObject ?: return
            val type = getStringField(obj, "type")

            when (type) {
                "callNative" -> {
                    val api = getStringField(obj, "api") ?: return
                    val callbackId = getStringField(obj, "callbackId") ?: ""
                    val params = getObjectField(obj, "params")
                    callNative(api, params, callbackId)
                }
                "event" -> {
                    val pageId = getStringField(obj, "pageId") ?: return
                    val eventType = getStringField(obj, "eventType") ?: return
                    val target = getStringField(obj, "target") ?: ""
                    val event = DOMEvent(
                        type = eventType,
                        target = target,
                        currentTarget = target,
                        timestamp = System.currentTimeMillis()
                    )
                    dispatchEvent(pageId, event)
                }
                "ready" -> {
                    // WebView is ready
                }
            }
        } catch (e: Exception) {
            // Ignore malformed messages
        }
    }

    // MARK: - JSON Helpers

    private fun serializeData(data: Map<String, Any>): String {
        val entries = data.entries.joinToString(",") { (key, value) ->
            "\"${escapeJson(key)}\":${serializeValue(value)}"
        }
        return "{$entries}"
    }

    private fun serializeValue(value: Any?): String {
        return when (value) {
            null -> "null"
            is String -> "\"${escapeJson(value)}\""
            is Number, is Boolean -> value.toString()
            is Map<*, *> -> {
                @Suppress("UNCHECKED_CAST")
                serializeData(value as Map<String, Any>)
            }
            is Collection<*> -> {
                val items = value.joinToString(",") { serializeValue(it) }
                "[$items]"
            }
            else -> "\"${escapeJson(value.toString())}\""
        }
    }

    private fun serializeResultData(data: Any?): String {
        return when (data) {
            null -> "null"
            is Map<*, *> -> {
                @Suppress("UNCHECKED_CAST")
                serializeData(data as Map<String, Any>)
            }
            is String -> "\"${escapeJson(data)}\""
            is Number, is Boolean -> data.toString()
            else -> "\"${escapeJson(data.toString())}\""
        }
    }

    private fun getStringField(obj: kotlinx.serialization.json.JsonObject, key: String): String? {
        return (obj[key] as? kotlinx.serialization.json.JsonPrimitive)?.content
    }

    private fun getObjectField(obj: kotlinx.serialization.json.JsonObject, key: String): Map<String, Any> {
        val element = obj[key] as? kotlinx.serialization.json.JsonObject ?: return emptyMap()
        return element.entries.associate { (k, v) ->
            k to (v as? kotlinx.serialization.json.JsonPrimitive)?.content.orEmpty()
        }
    }

    private fun escapeJson(str: String): String {
        return str
            .replace("\\", "\\\\")
            .replace("\"", "\\\"")
            .replace("\n", "\\n")
            .replace("\r", "\\r")
            .replace("\t", "\\t")
    }

    private fun escapeJsString(str: String): String {
        return str
            .replace("\\", "\\\\")
            .replace("'", "\\'")
            .replace("\n", "\\n")
            .replace("\r", "\\r")
    }
}
