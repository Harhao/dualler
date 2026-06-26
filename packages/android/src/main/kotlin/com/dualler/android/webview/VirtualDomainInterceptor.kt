package com.dualler.android.webview

import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebView
import android.webkit.WebViewClient
import java.io.File
import java.io.FileInputStream

/**
 * Virtual domain interceptor for resource isolation.
 *
 * Intercepts requests to the virtual domain (dualler.local) and serves
 * files from the local package directory. This prevents mini-program code
 * from accessing file:// URLs directly, improving security.
 *
 * Usage:
 *   - WebView loads HTML with baseURL "https://dualler.local"
 *   - All relative URLs (CSS, JS, images) are resolved against this domain
 *   - The interceptor serves files from the package directory
 *   - External URLs pass through to the network
 */
class VirtualDomainInterceptor(
    private val packageDir: File,
    private val virtualDomain: String = "dualler.local"
) : WebViewClient() {

    /**
     * Intercept resource requests.
     *
     * If the request is for the virtual domain, serve from local files.
     * Otherwise, let it pass through to the network.
     */
    override fun shouldInterceptRequest(view: WebView?, request: WebResourceRequest?): WebResourceResponse? {
        val url = request?.url ?: return null
        val host = url.host

        // Only intercept requests to our virtual domain
        if (host != virtualDomain) {
            return null
        }

        // Resolve the file path from the URL
        val path = url.path?.trimStart('/') ?: return null
        val file = File(packageDir, path)

        // Security check: ensure the file is within the package directory
        if (!file.canonicalPath.startsWith(packageDir.canonicalPath)) {
            return WebResourceResponse(
                "text/plain",
                "UTF-8",
                403,
                "Forbidden",
                mapOf("Content-Type" to "text/plain"),
                "Access denied".byteInputStream()
            )
        }

        // Serve the file if it exists
        if (file.exists() && file.isFile) {
            val mimeType = getMimeType(path)
            val inputStream = FileInputStream(file)

            return WebResourceResponse(
                mimeType,
                "UTF-8",
                200,
                "OK",
                mapOf(
                    "Content-Type" to mimeType,
                    "Access-Control-Allow-Origin" to "*"
                ),
                inputStream
            )
        }

        // File not found
        return WebResourceResponse(
            "text/plain",
            "UTF-8",
            404,
            "Not Found",
            mapOf("Content-Type" to "text/plain"),
            "File not found: $path".byteInputStream()
        )
    }

    /**
     * Get MIME type based on file extension.
     */
    private fun getMimeType(path: String): String {
        return when {
            path.endsWith(".html") || path.endsWith(".htm") -> "text/html"
            path.endsWith(".css") -> "text/css"
            path.endsWith(".js") -> "application/javascript"
            path.endsWith(".json") -> "application/json"
            path.endsWith(".png") -> "image/png"
            path.endsWith(".jpg") || path.endsWith(".jpeg") -> "image/jpeg"
            path.endsWith(".gif") -> "image/gif"
            path.endsWith(".svg") -> "image/svg+xml"
            path.endsWith(".webp") -> "image/webp"
            path.endsWith(".woff") -> "font/woff"
            path.endsWith(".woff2") -> "font/woff2"
            path.endsWith(".ttf") -> "font/ttf"
            path.endsWith(".eot") -> "application/vnd.ms-fontobject"
            path.endsWith(".mp4") -> "video/mp4"
            path.endsWith(".webm") -> "video/webm"
            path.endsWith(".mp3") -> "audio/mpeg"
            path.endsWith(".wav") -> "audio/wav"
            else -> "application/octet-stream"
        }
    }
}

/**
 * Extension to create a WebResourceResponse with status code (API 21+).
 */
private fun WebResourceResponse(
    mimeType: String,
    encoding: String,
    statusCode: Int,
    reasonPhrase: String,
    responseHeaders: Map<String, String>,
    data: java.io.InputStream
): WebResourceResponse {
    val response = WebResourceResponse(mimeType, encoding, data)
    response.setStatusCodeAndReasonPhrase(statusCode, reasonPhrase)
    response.responseHeaders = responseHeaders
    return response
}
