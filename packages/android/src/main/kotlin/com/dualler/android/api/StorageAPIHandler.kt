package com.dualler.android.api

import android.content.Context
import com.dualler.platform.APIHandler
import com.dualler.platform.model.APIResult

class StorageSetAPIHandler(private val context: Context) : APIHandler {
    private val prefs = context.getSharedPreferences("dualler_storage", Context.MODE_PRIVATE)

    override fun invoke(params: Map<String, Any>, callback: (APIResult) -> Unit) {
        val key = params["key"] as? String ?: run {
            callback(APIResult.Fail(-1, "key is required"))
            return
        }
        val data = params["data"]
        val value = data?.toString() ?: ""

        prefs.edit().putString(key, value).apply()
        callback(APIResult.Success(mapOf("errMsg" to "setStorage:ok")))
    }
}

class StorageGetAPIHandler(private val context: Context) : APIHandler {
    private val prefs = context.getSharedPreferences("dualler_storage", Context.MODE_PRIVATE)

    override fun invoke(params: Map<String, Any>, callback: (APIResult) -> Unit) {
        val key = params["key"] as? String ?: run {
            callback(APIResult.Fail(-1, "key is required"))
            return
        }
        val value = prefs.getString(key, null) ?: ""
        callback(APIResult.Success(mapOf("data" to value)))
    }
}

class StorageRemoveAPIHandler(private val context: Context) : APIHandler {
    private val prefs = context.getSharedPreferences("dualler_storage", Context.MODE_PRIVATE)

    override fun invoke(params: Map<String, Any>, callback: (APIResult) -> Unit) {
        val key = params["key"] as? String ?: run {
            callback(APIResult.Fail(-1, "key is required"))
            return
        }
        prefs.edit().remove(key).apply()
        callback(APIResult.Success(mapOf("errMsg" to "removeStorage:ok")))
    }
}
