package com.dualler.android.samelayer

/**
 * Native component placeholder info
 * Retrieved from WebView's data-native-component elements
 */
data class NativePlaceholder(
    val id: String,           // Component ID (e.g., "video_001")
    val type: String,         // Component type ("video", "map")
    val left: Int,            // Left position in WebView
    val top: Int,             // Top position in WebView
    val width: Int,           // Width
    val height: Int,          // Height
    val scrollX: Int = 0,     // Current scroll X
    val scrollY: Int = 0      // Current scroll Y
)
