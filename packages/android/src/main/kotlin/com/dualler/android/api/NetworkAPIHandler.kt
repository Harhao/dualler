package com.dualler.android.api

import android.content.Context
import com.dualler.platform.APIHandler
import com.dualler.platform.model.APIResult
import java.io.BufferedReader
import java.io.InputStreamReader
import java.net.HttpURLConnection
import java.net.URL

class NetworkAPIHandler(private val context: Context) : APIHandler {
    override fun invoke(params: Map<String, Any>, callback: (APIResult) -> Unit) {
        val url = params["url"] as? String ?: run {
            callback(APIResult.Fail(-1, "url is required"))
            return
        }
        val method = (params["method"] as? String ?: "GET").uppercase()
        val headers = params["headers"] as? Map<String, String> ?: emptyMap()
        val data = params["data"] as? String

        Thread {
            try {
                val connection = URL(url).openConnection() as HttpURLConnection
                connection.requestMethod = method
                connection.connectTimeout = 30000
                connection.readTimeout = 30000

                headers.forEach { (k, v) -> connection.setRequestProperty(k, v) }

                if (data != null && method in listOf("POST", "PUT", "PATCH")) {
                    connection.doOutput = true
                    connection.outputStream.write(data.toByteArray())
                }

                val responseCode = connection.responseCode
                val reader = BufferedReader(InputStreamReader(
                    if (responseCode >= 400) connection.errorStream else connection.inputStream
                ))
                val response = reader.readText()
                reader.close()

                callback(APIResult.Success(mapOf(
                    "statusCode" to responseCode,
                    "data" to response
                )))
            } catch (e: Exception) {
                callback(APIResult.Fail(-1, e.message ?: "Network error"))
            }
        }.start()
    }
}
