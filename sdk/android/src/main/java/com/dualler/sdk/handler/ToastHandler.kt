package com.dualler.sdk.handler

import android.app.Activity
import android.widget.Toast
import com.dualler.sdk.protocol.APIContract
import com.dualler.sdk.protocol.BridgeMessage

class ToastHandler(private val activity: Activity) : Handler {
    override val apiName: String = APIContract.SHOW_TOAST

    override fun handle(message: BridgeMessage): String? {
        val payload = message.payload as? Map<*, *> ?: return null
        val title = payload["title"] as? String ?: ""
        val duration = (payload["duration"] as? Number)?.toInt() ?: 2000
        val icon = payload["icon"] as? String ?: "none"

        val toastDuration = when (icon) {
            "success" -> Toast.LENGTH_SHORT
            "loading" -> Toast.LENGTH_LONG
            else -> Toast.LENGTH_SHORT
        }

        Toast.makeText(activity, title, toastDuration).show()
        return "{}"
    }
}
