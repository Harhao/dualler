package com.dualler.sdk.bridge

import com.dualler.sdk.protocol.BridgeMessage
import com.dualler.sdk.protocol.MessageType

class Parser {
    fun decode(raw: String): BridgeMessage? {
        // In production, use kotlinx.serialization
        // This is a minimal scaffold
        return try {
            // Simplified: assume JSON format
            // Real implementation would deserialize properly
            BridgeMessage(
                type = MessageType.valueOf("PATCH"), // placeholder
                payload = null,
                callbackId = null,
                timestamp = System.currentTimeMillis()
            )
        } catch (e: Exception) {
            null
        }
    }

    fun encode(message: BridgeMessage): String {
        // Serialize to JSON string
        return """{"type":"${message.type.name}","timestamp":${message.timestamp}}"""
    }
}
