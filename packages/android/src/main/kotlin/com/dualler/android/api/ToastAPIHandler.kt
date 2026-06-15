package com.dualler.android.api

import android.content.Context
import android.os.Handler
import android.os.Looper
import android.widget.Toast
import com.dualler.platform.APIHandler
import com.dualler.platform.model.APIResult

class ToastAPIHandler(private val context: Context) : APIHandler {
    override fun invoke(params: Map<String, Any>, callback: (APIResult) -> Unit) {
        val title = params["title"] as? String ?: ""
        val duration = params["duration"] as? Int ?: 1500

        Handler(Looper.getMainLooper()).post {
            val toast = Toast.makeText(context, title, if (duration > 1500) Toast.LENGTH_LONG else Toast.LENGTH_SHORT)
            toast.show()
        }
        callback(APIResult.Success(mapOf("errMsg" to "showToast:ok")))
    }
}

class ModalAPIHandler(private val context: Context) : APIHandler {
    override fun invoke(params: Map<String, Any>, callback: (APIResult) -> Unit) {
        // Simplified: in real implementation, show AlertDialog
        callback(APIResult.Success(mapOf("confirm" to true)))
    }
}

class VibrateAPIHandler(private val context: Context) : APIHandler {
    override fun invoke(params: Map<String, Any>, callback: (APIResult) -> Unit) {
        val vibrator = context.getSystemService(Context.VIBRATOR_SERVICE) as android.os.Vibrator
        @Suppress("DEPRECATION")
        vibrator.vibrate(15)
        callback(APIResult.Success(mapOf("errMsg" to "vibrate:ok")))
    }
}
