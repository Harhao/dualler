package com.dualler.android

import android.content.Context
import com.dualler.core.AppRuntime
import com.dualler.core.model.AppConfig
import com.dualler.platform.initPlatform

/**
 * Dualler SDK main entry point
 */
class DuallerSDK private constructor(
    private val context: Context,
    private val config: DuallerConfig
) {
    private var appRuntime: AppRuntime? = null

    companion object {
        @Volatile
        private var instance: DuallerSDK? = null

        fun init(context: Context, config: DuallerConfig = DuallerConfig()): DuallerSDK {
            return instance ?: synchronized(this) {
                instance ?: DuallerSDK(context.applicationContext, config).also {
                    initPlatform(AndroidPlatform(context))
                    instance = it
                }
            }
        }

        fun getInstance(): DuallerSDK {
            return instance ?: throw IllegalStateException("DuallerSDK not initialized")
        }
    }

    /**
     * Launch mini-program
     */
    suspend fun launchApp(packagePath: String) {
        val platform = com.dualler.platform.getPlatform()
        val appConfig = AppConfig(
            appId = "com.example.app",
            appName = "Test App",
            pages = listOf(packagePath)
        )
        appRuntime = AppRuntime(platform, appConfig)
        appRuntime?.launch(packagePath)
    }

    fun destroy() {
        appRuntime?.destroy()
        appRuntime = null
    }
}

data class DuallerConfig(
    val debug: Boolean = false,
    val maxPages: Int = 10,
    val jsHeapSizeMB: Int = 64
)
