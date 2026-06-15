package com.dualler.android.samelayer

import android.content.Context
import android.graphics.SurfaceTexture
import android.view.Surface
import android.view.TextureView
import android.view.View
import android.view.ViewGroup
import android.webkit.WebView
import android.widget.FrameLayout
import org.json.JSONArray
import org.json.JSONObject

/**
 * Same-layer renderer
 *
 * Overlays native components (VideoView, MapView) on top of WebView placeholder elements.
 * Supports scroll synchronization and z-order management.
 *
 * Flow:
 *   1. WebView loads page with data-native-component placeholders
 *   2. WebView ready -> notify NativeBridge
 *   3. SameLayerRenderer scans placeholders via JS Bridge
 *   4. Creates native View for each placeholder
 *   5. Positions native View to overlay WebView placeholder
 *   6. Listens to WebView scroll -> updates native View positions
 */
class SameLayerRenderer(
    private val context: Context,
    private val webView: WebView,
    private val container: ViewGroup
) {
    private val nativeViews = mutableMapOf<String, View>()
    private val placeholders = mutableMapOf<String, NativePlaceholder>()

    /**
     * Scan and mount native components
     * Called after WebView page load completes
     */
    fun mountNativeComponents() {
        // 1. Get all placeholder elements' coordinates via JS Bridge
        webView.evaluateJavascript("""
            (function() {
                var placeholders = document.querySelectorAll('[data-native-component]');
                var result = [];
                placeholders.forEach(function(el) {
                    var rect = el.getBoundingClientRect();
                    result.push({
                        id: el.getAttribute('data-component-id'),
                        type: el.getAttribute('data-native-component'),
                        left: Math.round(rect.left),
                        top: Math.round(rect.top),
                        width: Math.round(rect.width),
                        height: Math.round(rect.height)
                    });
                });
                return JSON.stringify(result);
            })()
        """) { json ->
            try {
                val cleanJson = json?.removeSurrounding("\"")?.replace("\\\"", "\"") ?: return@evaluateJavascript
                val placeholderArray = parsePlaceholders(cleanJson)
                placeholderArray.forEach { placeholder ->
                    placeholders[placeholder.id] = placeholder
                    mount(placeholder)
                }
            } catch (e: Exception) {
                e.printStackTrace()
            }
        }

        // 2. Listen to scroll events for position synchronization
        webView.setOnScrollChangeListener { _, _, scrollY, _, _ ->
            updateNativeViewPositions(scrollY)
        }
    }

    /**
     * Parse placeholder JSON array
     */
    private fun parsePlaceholders(json: String): List<NativePlaceholder> {
        val result = mutableListOf<NativePlaceholder>()
        val jsonArray = JSONArray(json)
        for (i in 0 until jsonArray.length()) {
            val obj = jsonArray.getJSONObject(i)
            result.add(
                NativePlaceholder(
                    id = obj.getString("id"),
                    type = obj.getString("type"),
                    left = obj.getInt("left"),
                    top = obj.getInt("top"),
                    width = obj.getInt("width"),
                    height = obj.getInt("height")
                )
            )
        }
        return result
    }

    /**
     * Mount a single native component
     */
    private fun mount(placeholder: NativePlaceholder) {
        val nativeView = when (placeholder.type) {
            "video" -> createVideoView(placeholder)
            "map" -> createMapPlaceholder(placeholder)
            else -> return
        }

        // Position the native view to overlay the WebView placeholder
        val layoutParams = FrameLayout.LayoutParams(placeholder.width, placeholder.height).apply {
            leftMargin = placeholder.left
            topMargin = placeholder.top
        }
        nativeView.layoutParams = layoutParams
        nativeView.tag = placeholder.id

        container.addView(nativeView)
        nativeViews[placeholder.id] = nativeView
    }

    /**
     * Create a VideoView for video component
     */
    private fun createVideoView(placeholder: NativePlaceholder): View {
        val textureView = TextureView(context)
        textureView.surfaceTextureListener = object : TextureView.SurfaceTextureListener {
            override fun onSurfaceTextureAvailable(surface: SurfaceTexture, width: Int, height: Int) {
                // Surface ready for video playback
            }
            override fun onSurfaceTextureSizeChanged(surface: SurfaceTexture, width: Int, height: Int) {}
            override fun onSurfaceTextureDestroyed(surface: SurfaceTexture): Boolean = true
            override fun onSurfaceTextureUpdated(surface: SurfaceTexture) {}
        }
        return textureView
    }

    /**
     * Create a placeholder for map component
     * In production, this would be a MapView
     */
    private fun createMapPlaceholder(placeholder: NativePlaceholder): View {
        val view = View(context)
        view.setBackgroundColor(0xFFE0E0E0.toInt()) // Gray placeholder
        return view
    }

    /**
     * Update native view positions when WebView scrolls
     */
    private fun updateNativeViewPositions(scrollY: Int) {
        // Re-evaluate placeholder positions
        webView.evaluateJavascript("""
            (function() {
                var placeholders = document.querySelectorAll('[data-native-component]');
                var result = [];
                placeholders.forEach(function(el) {
                    var rect = el.getBoundingClientRect();
                    result.push({
                        id: el.getAttribute('data-component-id'),
                        left: Math.round(rect.left),
                        top: Math.round(rect.top),
                        width: Math.round(rect.width),
                        height: Math.round(rect.height)
                    });
                });
                return JSON.stringify(result);
            })()
        """) { json ->
            try {
                val cleanJson = json?.removeSurrounding("\"")?.replace("\\\"", "\"") ?: return@evaluateJavascript
                val updatedPlaceholders = parsePlaceholders(cleanJson)
                updatedPlaceholders.forEach { updated ->
                    val nativeView = nativeViews[updated.id] ?: return@forEach
                    val layoutParams = nativeView.layoutParams as? FrameLayout.LayoutParams ?: return@forEach
                    layoutParams.leftMargin = updated.left
                    layoutParams.topMargin = updated.top
                    layoutParams.width = updated.width
                    layoutParams.height = updated.height
                    nativeView.layoutParams = layoutParams
                }
            } catch (e: Exception) {
                // Silently handle scroll update errors
            }
        }
    }

    /**
     * Update a native component's properties
     */
    fun updateComponent(componentId: String, properties: Map<String, Any>) {
        val nativeView = nativeViews[componentId] ?: return

        when (placeholders[componentId]?.type) {
            "video" -> {
                // Update video properties (src, autoplay, etc.)
                val src = properties["src"] as? String
                if (src != null) {
                    // In production: set video source
                }
            }
            "map" -> {
                // Update map properties (center, zoom, etc.)
            }
        }
    }

    /**
     * Remove a native component
     */
    fun unmountComponent(componentId: String) {
        nativeViews[componentId]?.let { view ->
            container.removeView(view)
            nativeViews.remove(componentId)
            placeholders.remove(componentId)
        }
    }

    /**
     * Remove all native components
     */
    fun unmountAll() {
        nativeViews.forEach { (_, view) ->
            container.removeView(view)
        }
        nativeViews.clear()
        placeholders.clear()
    }

    /**
     * Check if a component is mounted
     */
    fun isMounted(componentId: String): Boolean {
        return nativeViews.containsKey(componentId)
    }

    /**
     * Get mounted component count
     */
    fun getMountedCount(): Int = nativeViews.size
}
