package com.dualler.platform.provider

/**
 * Device capability interface
 */
interface DeviceProvider {
    fun getSystemInfo(): SystemInfo
    fun vibrate(type: VibrateType)
    fun getNetworkType(): NetworkType
}

data class SystemInfo(
    val brand: String,
    val model: String,
    val pixelRatio: Float,
    val screenWidth: Int,
    val screenHeight: Int,
    val windowWidth: Int,
    val windowHeight: Int,
    val statusBarHeight: Int,
    val language: String,
    val version: String,
    val platform: String,
    val SDKVersion: String
)

enum class VibrateType { SHORT, LONG, HEAVY, MEDIUM, LIGHT }
enum class NetworkType { WIFI, CELLULAR_2G, CELLULAR_3G, CELLULAR_4G, CELLULAR_5G, NONE, UNKNOWN }
