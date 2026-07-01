package com.dualler.sdk.handler

import com.dualler.sdk.protocol.APIContract
import com.dualler.sdk.protocol.BridgeMessage
import com.dualler.sdk.protocol.SandboxPaths
import android.content.Context
import android.content.SharedPreferences

class StorageHandler(private val context: Context) : Handler {
    override val apiName: String = APIContract.SET_STORAGE_SYNC

    private val prefs: SharedPreferences by lazy {
        context.getSharedPreferences(SandboxPaths.STORAGE_KEY, Context.MODE_PRIVATE)
    }

    override fun handle(message: BridgeMessage): String? {
        val payload = message.payload as? Map<*, *> ?: return null
        val key = payload["key"] as? String ?: return null
        val data = payload["data"]

        return when (message.type.name) {
            "SET" -> {
                prefs.edit().putString(key, data.toString()).apply()
                "{}"
            }
            "GET" -> {
                val value = prefs.getString(key, null)
                """{"data":$value}"""
            }
            "REMOVE" -> {
                prefs.edit().remove(key).apply()
                "{}"
            }
            "CLEAR" -> {
                prefs.edit().clear().apply()
                "{}"
            }
            else -> "{}"
        }
    }
}
