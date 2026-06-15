package com.dualler.android.api

import android.content.Context
import android.os.Build
import com.dualler.platform.APIHandler
import com.dualler.platform.model.APIResult

class DeviceInfoAPIHandler(private val context: Context) : APIHandler {
    override fun invoke(params: Map<String, Any>, callback: (APIResult) -> Unit) {
        val displayMetrics = context.resources.displayMetrics
        val result = mapOf(
            "brand" to Build.BRAND,
            "model" to Build.MODEL,
            "pixelRatio" to displayMetrics.density,
            "screenWidth" to displayMetrics.widthPixels,
            "screenHeight" to displayMetrics.heightPixels,
            "windowWidth" to displayMetrics.widthPixels,
            "windowHeight" to displayMetrics.heightPixels,
            "statusBarHeight" to getStatusBarHeight(),
            "language" to java.util.Locale.getDefault().language,
            "version" to Build.VERSION.RELEASE,
            "platform" to "android",
            "SDKVersion" to "1.0.0"
        )
        callback(APIResult.Success(result))
    }

    private fun getStatusBarHeight(): Int {
        val resourceId = context.resources.getIdentifier("status_bar_height", "dimen", "android")
        return if (resourceId > 0) context.resources.getDimensionPixelSize(resourceId) else 0
    }
}

class NetworkTypeAPIHandler(private val context: Context) : APIHandler {
    override fun invoke(params: Map<String, Any>, callback: (APIResult) -> Unit) {
        val connectivityManager = context.getSystemService(Context.CONNECTIVITY_SERVICE) as android.net.ConnectivityManager
        val network = connectivityManager.activeNetwork
        val capabilities = connectivityManager.getNetworkCapabilities(network)

        val type = when {
            capabilities == null -> "none"
            capabilities.hasTransport(android.net.NetworkCapabilities.TRANSPORT_WIFI) -> "wifi"
            capabilities.hasTransport(android.net.NetworkCapabilities.TRANSPORT_CELLULAR) -> "cellular"
            else -> "unknown"
        }

        callback(APIResult.Success(mapOf("networkType" to type)))
    }
}
