package com.dualler.sdk.handler

import com.dualler.sdk.protocol.BridgeMessage

/**
 * Handles canvas drawing operations.
 * Delegates to Android Canvas API.
 */
class CanvasHandler : Handler {
    override val apiName: String = "canvas"

    override fun handle(message: BridgeMessage): String? {
        // Canvas operations are typically executed on the UI thread
        // via the WebView. This handler records commands.
        return "{}"
    }
}
