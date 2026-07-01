package com.dualler.sdk.protocol

import kotlinx.serialization.Serializable

@Serializable
data class BridgeMessage(
    val type: MessageType,
    val payload: Any? = null,
    val callbackId: String? = null,
    val timestamp: Long = System.currentTimeMillis()
)

enum class MessageType {
    PATCH, API_CALL, API_RESPONSE, EVENT
}
