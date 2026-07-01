package com.example.duallertest

import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import com.dualler.sdk.DuallerEngine
import com.dualler.sdk.EngineConfig

class MainActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // 初始化 Dualler 引擎，加载 assets 中的 bundle
        val bundleUrl = "file:///android_asset/dist/index.bundle.js"
        val config = EngineConfig(
            debugMode = BuildConfig.DEBUG,
            bundleURL = bundleUrl
        )

        try {
            val engine = DuallerEngine.init(this, config)
            setContentView(engine.webView)
        } catch (e: Exception) {
            e.printStackTrace()
            // 降级：显示错误信息
            setContentView(android.widget.TextView(this).apply {
                text = "Failed to initialize Dualler: ${e.message}"
            })
        }
    }
}
