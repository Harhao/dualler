package com.dualler.android

import android.os.Bundle
import android.webkit.WebView
import android.webkit.WebViewClient
import android.webkit.WebChromeClient
import android.webkit.JavascriptInterface
import android.widget.FrameLayout
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import java.io.File

/**
 * Dualler 小程序 Activity
 *
 * 加载并运行小程序
 */
class DuallerActivity : AppCompatActivity() {

    private lateinit var webView: WebView
    private var appId: String = ""

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // 获取 appId
        appId = intent.getStringExtra("appId") ?: "com.example.dualler-demo"

        // 创建 WebView
        webView = WebView(this).apply {
            settings.apply {
                javaScriptEnabled = true
                domStorageEnabled = true
                allowFileAccess = true
                allowFileAccessFromFileURLs = true
                allowUniversalAccessFromFileURLs = true
            }

            webViewClient = object : WebViewClient() {
                override fun onPageFinished(view: WebView?, url: String?) {
                    super.onPageFinished(view, url)
                    // 页面加载完成，注入 Bridge
                    injectBridge()
                }
            }

            webChromeClient = object : WebChromeClient() {
                override fun onConsoleMessage(consoleMessage: android.webkit.ConsoleMessage?): Boolean {
                    consoleMessage?.let {
                        android.util.Log.d("Dualler", "${it.messageLevel()}: ${it.message()}")
                    }
                    return true
                }
            }

            // 添加 JS 接口
            addJavascriptInterface(object {
                @JavascriptInterface
                fun postMessage(message: String) {
                    android.util.Log.d("Dualler", "Message from WebView: $message")
                    // 处理来自渲染层的消息
                    runOnUiThread {
                        handleWebViewMessage(message)
                    }
                }
            }, "dualler")
        }

        // 设置布局
        val container = FrameLayout(this)
        container.addView(webView, FrameLayout.LayoutParams(
            FrameLayout.LayoutParams.MATCH_PARENT,
            FrameLayout.LayoutParams.MATCH_PARENT
        ))
        setContentView(container)

        // 加载小程序
        loadMiniProgram()
    }

    private fun loadMiniProgram() {
        // 小程序包路径
        val packagePath = "/sdcard/dualler/packages/$appId"
        val packageDir = File(packagePath)

        if (!packageDir.exists()) {
            Toast.makeText(this, "小程序包不存在: $packagePath", Toast.LENGTH_LONG).show()
            finish()
            return
        }

        // 读取首页
        val indexHtml = File(packageDir, "pages/index/index.html")
        if (indexHtml.exists()) {
            val html = indexHtml.readText()
            val css = File(packageDir, "pages/index/index.css").let {
                if (it.exists()) it.readText() else ""
            }
            val js = File(packageDir, "pages/index/index.js").let {
                if (it.exists()) it.readText() else ""
            }

            // 构建完整 HTML
            val fullHtml = buildHtml(html, css, js)

            // 加载到 WebView
            webView.loadDataWithBaseURL(
                "https://dualler.local",
                fullHtml,
                "text/html",
                "UTF-8",
                null
            )
        } else {
            Toast.makeText(this, "首页文件不存在", Toast.LENGTH_LONG).show()
            finish()
        }
    }

    private fun buildHtml(bodyHtml: String, css: String, js: String): String {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body {
                        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                        font-size: 14px;
                        line-height: 1.5;
                        color: #333;
                        background: #f5f5f5;
                    }
                    view { display: block; }
                    text { display: inline; }
                    button {
                        display: inline-block;
                        padding: 8px 16px;
                        border: 1px solid #ddd;
                        border-radius: 4px;
                        background: #fff;
                        cursor: pointer;
                        font-size: 14px;
                    }
                    button:active { background: #f0f0f0; }
                    input, textarea {
                        padding: 8px;
                        border: 1px solid #ddd;
                        border-radius: 4px;
                        font-size: 14px;
                    }
                    $css
                </style>
            </head>
            <body>
                <div id="app">$bodyHtml</div>
                <script>
                    // Dualler 运行时
                    var wx = {
                        showToast: function(opts) {
                            dualler.postMessage(JSON.stringify({
                                type: 'api',
                                api: 'showToast',
                                params: opts
                            }));
                        },
                        showModal: function(opts) {
                            dualler.postMessage(JSON.stringify({
                                type: 'api',
                                api: 'showModal',
                                params: opts
                            }));
                        },
                        navigateTo: function(opts) {
                            dualler.postMessage(JSON.stringify({
                                type: 'api',
                                api: 'navigateTo',
                                params: opts
                            }));
                        },
                        navigateBack: function() {
                            dualler.postMessage(JSON.stringify({
                                type: 'api',
                                api: 'navigateBack'
                            }));
                        },
                        getSystemInfo: function(opts) {
                            dualler.postMessage(JSON.stringify({
                                type: 'api',
                                api: 'getSystemInfo',
                                params: opts
                            }));
                        }
                    };

                    // 页面脚本
                    $js

                    // 通知就绪
                    dualler.postMessage(JSON.stringify({ type: 'ready' }));
                </script>
            </body>
            </html>
        """.trimIndent()
    }

    private fun injectBridge() {
        val bridgeScript = """
            window.__dualler_render__ = {
                patch: function(pageId, data) {
                    for (var key in data) {
                        var elements = document.querySelectorAll('[data-bind-' + key + ']');
                        elements.forEach(function(el) {
                            el.textContent = data[key];
                        });
                    }
                }
            };
        """.trimIndent()

        webView.evaluateJavascript(bridgeScript, null)
    }

    private fun handleWebViewMessage(message: String) {
        try {
            val json = org.json.JSONObject(message)
            val type = json.optString("type")

            when (type) {
                "ready" -> {
                    android.util.Log.d("Dualler", "WebView ready")
                }
                "api" -> {
                    val api = json.optString("api")
                    val params = json.optJSONObject("params")
                    handleApiCall(api, params)
                }
                "event" -> {
                    val event = json.optString("event")
                    android.util.Log.d("Dualler", "Event: $event")
                }
            }
        } catch (e: Exception) {
            android.util.Log.e("Dualler", "Error parsing message: $message", e)
        }
    }

    private fun handleApiCall(api: String, params: org.json.JSONObject?) {
        when (api) {
            "showToast" -> {
                val title = params?.optString("title") ?: ""
                Toast.makeText(this, title, Toast.LENGTH_SHORT).show()
            }
            "showModal" -> {
                val title = params?.optString("title") ?: "提示"
                val content = params?.optString("content") ?: ""
                android.app.AlertDialog.Builder(this)
                    .setTitle(title)
                    .setMessage(content)
                    .setPositiveButton("确定") { _, _ -> }
                    .setNegativeButton("取消") { _, _ -> }
                    .show()
            }
            "navigateBack" -> {
                finish()
            }
            "getSystemInfo" -> {
                val info = """
                    {
                        "brand": "${android.os.Build.BRAND}",
                        "model": "${android.os.Build.MODEL}",
                        "pixelRatio": ${resources.displayMetrics.density},
                        "screenWidth": ${resources.displayMetrics.widthPixels},
                        "screenHeight": ${resources.displayMetrics.heightPixels},
                        "language": "${java.util.Locale.getDefault().language}",
                        "platform": "android",
                        "SDKVersion": "1.0.0"
                    }
                """.trimIndent()
                webView.evaluateJavascript(
                    "if(typeof wx._systemInfoCallback === 'function') wx._systemInfoCallback($info)",
                    null
                )
            }
        }
    }

    override fun onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack()
        } else {
            super.onBackPressed()
        }
    }

    override fun onDestroy() {
        webView.destroy()
        super.onDestroy()
    }
}
