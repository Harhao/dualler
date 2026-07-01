package com.dualler.sdk.handler

import com.dualler.sdk.protocol.BridgeMessage

/**
 * Base interface for all bridge handlers.
 * Each handler processes a specific category of API calls.
 */
interface Handler {
    val apiName: String
    fun handle(message: BridgeMessage): String?
}
