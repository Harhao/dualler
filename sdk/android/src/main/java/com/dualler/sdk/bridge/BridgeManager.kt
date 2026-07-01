package com.dualler.sdk.bridge

import com.dualler.sdk.protocol.BridgeMessage
import com.dualler.sdk.protocol.MessageType
import com.dualler.sdk.view.DuallerWebView

class BridgeManager(private val webView: DuallerWebView) {
    private val parser = Parser()
    private val router = Router()
    private val handlers = mutableMapOf<String, Handler>()

    fun registerHandler(type: String, handler: Handler) {
        handlers[type] = handler
    }

    fun handleMessage(rawMessage: String): String? {
        val message = parser.decode(rawMessage) ?: return null
        return when (message.type) {
            MessageType.API_CALL -> handleAPICall(message)
            MessageType.PATCH -> handlePatch(message)
            MessageType.EVENT -> handleEvent(message)
            MessageType.API_RESPONSE -> handleResponse(message)
        }
    }

    private fun handleAPICall(message: BridgeMessage): String? {
        val apiName = (message.payload as? Map<*, *>)?.get("api") as? String ?: return null
        val handler = handlers[apiName]
        return handler?.handle(message)
    }

    private fun handlePatch(message: BridgeMessage): String? {
        // Forward patch instructions to the renderer
        return null
    }

    private fun handleEvent(message: BridgeMessage): String? {
        // Forward events to appropriate handlers
        return null
    }

    private fun handleResponse(message: BridgeMessage): String? {
        // Route response back to Runtime
        return null
    }
}

fun interface Handler {
    fun handle(message: BridgeMessage): String?
}
