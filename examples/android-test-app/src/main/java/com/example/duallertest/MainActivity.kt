package com.example.duallertest

import android.os.Bundle
import android.util.Log
import androidx.appcompat.app.AppCompatActivity
import com.dualler.sdk.DuallerEngine
import com.dualler.sdk.EngineConfig

class MainActivity : AppCompatActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Load from dist/pages/index/index.js (new naming convention)
        val bundleUrl = "file:///android_asset/dist/pages/index/index.js"
        Log.d("DuallerTest", "Loading bundle: $bundleUrl")

        val config = EngineConfig(
            debugMode = BuildConfig.DEBUG,
            bundleUrl = bundleUrl,
            maxCacheSize = 5
        )

        try {
            val engine = DuallerEngine.init(this, config)
            setContentView(engine.webView)
            Log.d("DuallerTest", "Dualler engine initialized successfully")
        } catch (e: Exception) {
            Log.e("DuallerTest", "Failed to initialize Dualler", e)
            setContentView(android.widget.TextView(this).apply {
                text = "Failed to initialize Dualler: ${e.message}"
            })
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        DuallerEngine.destroy()
    }
}
