package com.dualler.sdk.handler

import android.content.Context
import android.os.Build
import com.dualler.sdk.protocol.APIContract
import com.dualler.sdk.protocol.BridgeMessage

class DeviceHandler(private val context: Context) : Handler {
    override val apiName: String = APIContract.GET_SYSTEM_INFO

    override fun handle(message: BridgeMessage): String? {
        return """{
            "brand":"${Build.BRAND}",
            "model":"${Build.MODEL}",
            "system":"Android ${Build.VERSION.RELEASE}",
            "platform":"android",
            "sdkVersion":"${Build.VERSION.SDK_INT}"
        }""".replace("\n", "").replace(", ", "")
    }
}
