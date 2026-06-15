package com.dualler.android.bridge

import com.dualler.platform.APIHandler
import com.dualler.platform.PlatformBridge
import com.dualler.platform.model.APIResult
import com.dualler.platform.model.DOMEvent
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json

/**
 * Android implementation of [PlatformBridge].
 *
 * Coordinates communication between the logic layer, render layer, and native layer.
 * TODO: Connect setData/dispatchEvent/invokeCallback to WebView and JSEngine once
 *       the message channel is wired up.
 */
class AndroidPlatformBridge : PlatformBridge {
    private val apiHandlers = mutableMapOf<String, APIHandler>()
    private val json = Json { ignoreUnknownKeys = true }

    override fun setData(pageId: String, data: Map<String, Any>) {
        // Will be connected to WebView via WebMessagePort
        // TODO: Serialize and send to WebView render layer
    }

    override fun dispatchEvent(pageId: String, event: DOMEvent) {
        // Will be connected to JSEngine
        // TODO: Serialize and send to JSEngine logic layer
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
        // Will be connected to JSEngine
        // TODO: Send callback result to JSEngine
    }

    override fun registerAPI(name: String, handler: APIHandler) {
        apiHandlers[name] = handler
    }
}
