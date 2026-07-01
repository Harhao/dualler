package com.dualler.sdk.handler

import android.app.Activity
import com.dualler.sdk.protocol.APIContract
import com.dualler.sdk.protocol.BridgeMessage

class NavigationHandler(private val activity: Activity) : Handler {
    override val apiName: String = APIContract.NAVIGATE_TO

    override fun handle(message: BridgeMessage): String? {
        val payload = message.payload as? Map<*, *> ?: return null
        val url = payload["url"] as? String ?: return null
        // In a real app, this would navigate between Activities/fragments
        // For the scaffold, log the navigation
        android.util.Log.d("DuallerNav", "Navigate to: $url")
        return "{}"
    }
}
