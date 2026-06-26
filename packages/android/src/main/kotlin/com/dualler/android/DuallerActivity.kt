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
                        width: 100%;
                    }
                    [v-cloak] { display: none; }
                    $css
                </style>
            </head>
            <body>
                <div id="app" v-cloak>$bodyHtml</div>
                <script>
                    // === wx platform API ===
                    var wx = {
                        showToast: function(opts) {
                            dualler.postMessage(JSON.stringify({
                                type: 'api', api: 'showToast', params: opts
                            }));
                        },
                        showModal: function(opts) {
                            dualler.postMessage(JSON.stringify({
                                type: 'api', api: 'showModal', params: opts
                            }));
                        },
                        navigateTo: function(opts) {
                            dualler.postMessage(JSON.stringify({
                                type: 'api', api: 'navigateTo', params: opts
                            }));
                        },
                        navigateBack: function() {
                            dualler.postMessage(JSON.stringify({
                                type: 'api', api: 'navigateBack'
                            }));
                        },
                        getSystemInfo: function(opts) {
                            var info = {
                                brand: '${android.os.Build.BRAND}',
                                model: '${android.os.Build.MODEL}',
                                screenWidth: ${resources.displayMetrics.widthPixels},
                                screenHeight: ${resources.displayMetrics.heightPixels},
                                language: '${java.util.Locale.getDefault().language}',
                                platform: 'android',
                                SDKVersion: '1.0.0'
                            };
                            if (opts.success) opts.success(info);
                        },
                        setStorageSync: function(key, value) {
                            dualler.postMessage(JSON.stringify({
                                type: 'api', api: 'setStorage', params: {key: key, data: value}
                            }));
                        },
                        getStorageSync: function(key) {
                            return localStorage.getItem(key) || '';
                        },
                        clearStorageSync: function() {
                            localStorage.clear();
                        },
                        request: function(opts) {
                            var xhr = new XMLHttpRequest();
                            xhr.open(opts.method || 'GET', opts.url);
                            xhr.onload = function() {
                                var data;
                                try { data = JSON.parse(xhr.responseText); } catch(e) { data = xhr.responseText; }
                                opts.success && opts.success({ data: data, statusCode: xhr.status });
                            };
                            xhr.onerror = function() {
                                opts.fail && opts.fail({ errMsg: 'request:fail' });
                            };
                            xhr.send(opts.data ? JSON.stringify(opts.data) : null);
                        }
                    };

                    // === Vue lifecycle stubs ===
                    function onMounted(fn) { fn(); }
                    function onLaunch(fn) { fn(); }
                    function onShow(fn) { fn(); }
                    function onHide(fn) { fn(); }

                    // === Page script (loaded before runtime so wrapper can find functions) ===
                    $js

                    // === Dualler mini runtime ===
                    (function() {
                        var app = document.getElementById('app');

                        function resolve(path, scope) {
                            var parts = path.split('.');
                            var val = scope;
                            for (var i = 0; i < parts.length; i++) {
                                if (val == null) return undefined;
                                val = val[parts[i]];
                            }
                            return val;
                        }

                        function evalExpr(expr, scope) {
                            try {
                                with (scope) { return eval(expr); }
                            } catch(e) { return undefined; }
                        }

                        function bindEvents(el, scope) {
                            var attr = el.getAttribute('onclick');
                            if (attr) {
                                el.removeAttribute('onclick');
                                el.addEventListener('click', function(evt) {
                                    evalExpr(attr, scope);
                                });
                            }
                            var inputAttr = el.getAttribute('oninput');
                            if (inputAttr) {
                                el.removeAttribute('oninput');
                                el.addEventListener('input', function(evt) {
                                    scope.e = { detail: evt.target.value };
                                    evalExpr(inputAttr, scope);
                                    delete scope.e;
                                    render();
                                });
                            }
                        }

                        function processVFor(el, scope) {
                            var expr = el.getAttribute('v-for');
                            if (!expr) return null;
                            el.removeAttribute('v-for');
                            var match = expr.match(/\((\w+),\s*(\w+)\)\s+in\s+(\S+)/) ||
                                        expr.match(/(\w+)\s+in\s+(\S+)/);
                            if (!match) return null;
                            var itemName, indexName, arrPath;
                            if (match.length === 4) {
                                itemName = match[1]; indexName = match[2]; arrPath = match[3];
                            } else {
                                itemName = match[1]; indexName = 'index'; arrPath = match[2];
                            }
                            var arr = resolve(arrPath, scope);
                            if (!Array.isArray(arr)) return null;
                            var frag = document.createDocumentFragment();
                            var templateHtml = el.outerHTML;
                            for (var i = 0; i < arr.length; i++) {
                                var clone = document.createElement('div');
                                clone.innerHTML = templateHtml;
                                var child = clone.firstChild;
                                var childScope = Object.create(scope);
                                childScope[itemName] = arr[i];
                                childScope[indexName] = i;
                                processElement(child, childScope);
                                frag.appendChild(child);
                            }
                            return frag;
                        }

                        function processVIf(el, scope) {
                            var expr = el.getAttribute('v-if');
                            if (expr === null) return true;
                            el.removeAttribute('v-if');
                            return !!evalExpr(expr, scope);
                        }

                        function processClassBind(el, scope) {
                            var expr = el.getAttribute(':class');
                            if (!expr) return;
                            el.removeAttribute(':class');
                            var val = evalExpr(expr, scope);
                            if (typeof val === 'string') {
                                el.className += ' ' + val;
                            } else if (typeof val === 'object' && val) {
                                for (var cls in val) {
                                    if (val[cls]) el.classList.add(cls);
                                }
                            }
                        }

                        function processValueBind(el, scope) {
                            var expr = el.getAttribute(':value');
                            if (!expr) return;
                            el.removeAttribute(':value');
                            var val = resolve(expr, scope);
                            if (val !== undefined) el.value = val;
                        }

                        function processSrcBind(el, scope) {
                            var expr = el.getAttribute(':src');
                            if (!expr) return;
                            el.removeAttribute(':src');
                            var val = evalExpr(expr, scope);
                            if (val !== undefined) el.setAttribute('src', String(val));
                        }

                        function processDataBinds(el, scope) {
                            var attrs = el.attributes;
                            var toRemove = [];
                            for (var i = 0; i < attrs.length; i++) {
                                var name = attrs[i].name;
                                if (name.indexOf('data-bind-') === 0) {
                                    var exprPath = attrs[i].value;
                                    var val = resolve(exprPath, scope);
                                    if (val !== undefined) el.textContent = String(val);
                                    toRemove.push(name);
                                }
                            }
                            for (var j = 0; j < toRemove.length; j++) {
                                el.removeAttribute(toRemove[j]);
                            }
                        }

                        function processElement(el, scope) {
                            if (!processVIf(el, scope)) {
                                el.parentNode && el.parentNode.removeChild(el);
                                return;
                            }
                            var forFrag = processVFor(el, scope);
                            if (forFrag) {
                                el.parentNode.replaceChild(forFrag, el);
                                return;
                            }
                            processClassBind(el, scope);
                            processValueBind(el, scope);
                            processSrcBind(el, scope);
                            processDataBinds(el, scope);
                            bindEvents(el, scope);
                            var children = Array.prototype.slice.call(el.children);
                            for (var i = 0; i < children.length; i++) {
                                processElement(children[i], scope);
                            }
                        }

                        function render() {
                            var html = app.getAttribute('data-template');
                            if (!html) return;
                            app.innerHTML = html;
                            var children = Array.prototype.slice.call(app.children);
                            for (var i = 0; i < children.length; i++) {
                                processElement(children[i], window);
                            }
                            app.removeAttribute('v-cloak');
                        }

                        app.setAttribute('data-template', app.innerHTML);
                        render();
                        window.__dualler_render = render;
                    })();

                    // Wrap user functions to auto-render after each call
                    (function() {
                        var skipRender = ['onInput'];
                        for (var k in window) {
                            if (typeof window[k] === 'function' && skipRender.indexOf(k) === -1 &&
                                k.indexOf('__') !== 0 && k !== 'render') {
                                (function(name) {
                                    var orig = window[name];
                                    window[name] = function() {
                                        var result = orig.apply(this, arguments);
                                        window.__dualler_render && window.__dualler_render();
                                        return result;
                                    };
                                })(k);
                            }
                        }
                    })();

                    dualler.postMessage(JSON.stringify({ type: 'ready' }));
                </script>
            </body>
            </html>
        """.trimIndent()
    }

    private fun injectBridge() {
        // Bridge is now embedded in buildHtml runtime
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
            "navigateTo" -> {
                handleNavigateTo(params)
            }
            "redirectTo" -> {
                handleNavigateTo(params)  // In single WebView mode, same as navigateTo
            }
            "navigateBack" -> {
                handleNavigateBack(params)
            }
            "reLaunch" -> {
                handleNavigateTo(params)  // In single WebView mode, same as navigateTo
            }
            "getSystemInfo" -> {
                // Handled directly in JS shim now
            }
        }
    }

    /**
     * Handle navigateTo by loading a new page in the WebView
     *
     * In the simplified DuallerActivity (single WebView), we just load
     * the new page HTML. For full page stack support, use the KMP AppRuntime.
     */
    private fun handleNavigateTo(params: org.json.JSONObject?) {
        val url = params?.optString("url") ?: return

        // Parse URL: /pages/path/path?key=value
        val path = url.split("?")[0].removePrefix("/")
        val htmlFile = "$path.html"

        try {
            val html = assets.open(htmlFile).bufferedReader().use { it.readText() }
            webView.loadDataWithBaseURL(
                "file:///android_asset/",
                html,
                "text/html",
                "UTF-8",
                null
            )
        } catch (e: Exception) {
            android.util.Log.e("Dualler", "Failed to load page: $htmlFile", e)
        }
    }

    /**
     * Handle navigateBack
     */
    private fun handleNavigateBack(params: org.json.JSONObject?) {
        if (webView.canGoBack()) {
            webView.goBack()
        } else {
            finish()
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
