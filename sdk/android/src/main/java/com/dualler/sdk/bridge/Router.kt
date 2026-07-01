package com.dualler.sdk.bridge

import com.dualler.sdk.protocol.BridgeMessage
import com.dualler.sdk.bridge.Handler

class Router {
    fun route(message: BridgeMessage, handlers: Map<String, Handler>): String? {
        val apiName = extractAPIName(message)
        val handler = handlers[apiName]
        return handler?.handle(message)
    }

    private fun extractAPIName(message: BridgeMessage): String? {
        val payload = message.payload as? Map<*, *>
        return payload?.get("api") as? String
    }
}
