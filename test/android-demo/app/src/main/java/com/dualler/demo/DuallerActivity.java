package com.dualler.demo;

import android.os.Bundle;
import android.os.Environment;
import android.webkit.JavascriptInterface;
import android.webkit.WebChromeClient;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import java.io.File;

/**
 * Dualler 小程序 Activity
 *
 * 加载并运行小程序
 */
public class DuallerActivity extends AppCompatActivity {

    private WebView webView;
    private String appId;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        appId = getIntent().getStringExtra("appId");

        // 创建 WebView
        webView = new WebView(this);
        webView.getSettings().setJavaScriptEnabled(true);
        webView.getSettings().setDomStorageEnabled(true);
        webView.getSettings().setAllowFileAccess(true);

        webView.setWebViewClient(new WebViewClient());
        webView.setWebChromeClient(new WebChromeClient());

        // 添加 JS 接口
        webView.addJavascriptInterface(new Object() {
            @JavascriptInterface
            public void postMessage(String message) {
                runOnUiThread(() -> handleWebViewMessage(message));
            }
        }, "dualler");

        // 设置布局
        FrameLayout container = new FrameLayout(this);
        container.addView(webView, new FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT,
                FrameLayout.LayoutParams.MATCH_PARENT));
        setContentView(container);

        // 加载小程序
        loadMiniProgram();
    }

    private void loadMiniProgram() {
        File packageDir = new File(Environment.getExternalStorageDirectory(),
                "dualler/packages/" + appId);

        if (!packageDir.exists()) {
            Toast.makeText(this, "小程序包不存在", Toast.LENGTH_LONG).show();
            finish();
            return;
        }

        File indexHtml = new File(packageDir, "pages/index/index.html");
        if (!indexHtml.exists()) {
            Toast.makeText(this, "首页文件不存在", Toast.LENGTH_LONG).show();
            finish();
            return;
        }

        try {
            String html = readFile(indexHtml);
            String css = readFile(new File(packageDir, "pages/index/index.css"));
            String js = readFile(new File(packageDir, "pages/index/index.js"));

            String fullHtml = buildHtml(html, css, js);
            webView.loadDataWithBaseURL("https://dualler.local", fullHtml, "text/html", "UTF-8", null);
        } catch (Exception e) {
            Toast.makeText(this, "加载失败: " + e.getMessage(), Toast.LENGTH_LONG).show();
            finish();
        }
    }

    private String buildHtml(String bodyHtml, String css, String js) {
        return "<!DOCTYPE html>\n" +
                "<html>\n" +
                "<head>\n" +
                "  <meta charset=\"UTF-8\">\n" +
                "  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n" +
                "  <style>\n" +
                "    * { margin: 0; padding: 0; box-sizing: border-box; }\n" +
                "    body { font-family: sans-serif; font-size: 14px; color: #333; background: #f5f5f5; }\n" +
                "    view { display: block; }\n" +
                "    text { display: inline; }\n" +
                "    button { padding: 8px 16px; border: 1px solid #ddd; border-radius: 4px; background: #fff; cursor: pointer; }\n" +
                "    input, textarea { padding: 8px; border: 1px solid #ddd; border-radius: 4px; }\n" +
                "    " + css + "\n" +
                "  </style>\n" +
                "</head>\n" +
                "<body>\n" +
                "  <div id=\"app\">" + bodyHtml + "</div>\n" +
                "  <script>\n" +
                "    var wx = {\n" +
                "      showToast: function(opts) { dualler.postMessage(JSON.stringify({type:'api',api:'showToast',params:opts})); },\n" +
                "      showModal: function(opts) { dualler.postMessage(JSON.stringify({type:'api',api:'showModal',params:opts})); },\n" +
                "      navigateTo: function(opts) { dualler.postMessage(JSON.stringify({type:'api',api:'navigateTo',params:opts})); },\n" +
                "      navigateBack: function() { dualler.postMessage(JSON.stringify({type:'api',api:'navigateBack'})); },\n" +
                "      getSystemInfo: function(opts) { dualler.postMessage(JSON.stringify({type:'api',api:'getSystemInfo',params:opts})); }\n" +
                "    };\n" +
                "    " + js + "\n" +
                "    dualler.postMessage(JSON.stringify({type:'ready'}));\n" +
                "  </script>\n" +
                "</body>\n" +
                "</html>";
    }

    private String readFile(File file) {
        try {
            java.io.FileInputStream fis = new java.io.FileInputStream(file);
            byte[] data = new byte[(int) file.length()];
            fis.read(data);
            fis.close();
            return new String(data, "UTF-8");
        } catch (Exception e) {
            return "";
        }
    }

    private void handleWebViewMessage(String message) {
        try {
            org.json.JSONObject json = new org.json.JSONObject(message);
            String type = json.optString("type");

            if ("api".equals(type)) {
                String api = json.optString("api");
                org.json.JSONObject params = json.optJSONObject("params");
                handleApiCall(api, params);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private void handleApiCall(String api, org.json.JSONObject params) {
        switch (api) {
            case "showToast":
                String title = params.optString("title", "");
                Toast.makeText(this, title, Toast.LENGTH_SHORT).show();
                break;
            case "showModal":
                new android.app.AlertDialog.Builder(this)
                        .setTitle(params.optString("title", "提示"))
                        .setMessage(params.optString("content", ""))
                        .setPositiveButton("确定", null)
                        .show();
                break;
            case "navigateBack":
                finish();
                break;
        }
    }

    @Override
    public void onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }

    @Override
    protected void onDestroy() {
        if (webView != null) {
            webView.destroy();
        }
        super.onDestroy();
    }
}
