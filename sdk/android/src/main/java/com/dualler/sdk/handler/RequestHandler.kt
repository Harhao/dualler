package com.dualler.sdk.handler

import com.dualler.sdk.protocol.APIContract
import com.dualler.sdk.protocol.BridgeMessage
import java.net.HttpURLConnection
import java.net.URL

class RequestHandler : Handler {
    override val apiName: String = APIContract.REQUEST

    override fun handle(message: BridgeMessage): String? {
        val payload = message.payload as? Map<*, *> ?: return null
        val urlStr = payload["url"] as? String ?: return null
        val method = (payload["method"] as? String) ?: "GET"

        return try {
            val conn = URL(urlStr).openConnection() as HttpURLConnection
            conn.requestMethod = method
            conn.connect()

            val body = conn.inputStream.readBytes().decodeToString()
            conn.disconnect()

            """{"statusCode":${conn.responseCode},"data":$body}"""
        } catch (e: Exception) {
            """{"errMsg":"request fail: ${e.message}"}"""
        }
    }
}
