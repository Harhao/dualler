package com.dualler.sdk.handler

import android.app.Activity
import com.dualler.sdk.protocol.APIContract
import com.dualler.sdk.protocol.BridgeMessage

/**
 * Handles media selection (chooseImage, chooseVideo).
 */
class MediaHandler(private val activity: Activity) : Handler {
    override val apiName: String = APIContract.CHOOSE_IMAGE

    override fun handle(message: BridgeMessage): String? {
        // In production, would launch gallery picker intent
        // For scaffold, return placeholder
        return """{"tempFilePaths":[],"tempFiles":[]}"""
    }
}
