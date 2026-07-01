package com.dualler.sdk.view

import android.content.Context
import android.view.View
import android.widget.ImageView
import android.widget.LinearLayout
import android.widget.TextView
import android.util.TypedValue
import android.graphics.Color

/**
 * Manages native UI views that correspond to DSL nodes.
 */
class ViewManager(private val context: Context) {
    private val views = mutableMapOf<String, View>()

    fun createView(nodeType: String, props: Map<String, Any?>): View {
        return when (nodeType) {
            "view" -> createContainerView(props)
            "text" -> createTextView(props)
            "image" -> createImageView(props)
            else -> createDefaultView(props)
        }
    }

    fun registerView(id: String, view: View) {
        views[id] = view
    }

    fun getView(id: String): View? = views[id]

    fun removeView(id: String) {
        views.remove(id)
    }

    private fun createContainerView(props: Map<String, Any?>): View {
        return LinearLayout(context).apply {
            orientation = LinearLayout.VERTICAL
        }
    }

    private fun createTextView(props: Map<String, Any?>): View {
        return TextView(context).apply {
            val textSize = (props["fontSize"] as? Number)?.toInt() ?: 14
            setTextSize(TypedValue.COMPLEX_UNIT_SP, textSize.toFloat())
            val color = (props["color"] as? String) ?: "#000000"
            setTextColor(Color.parseColor(color))
        }
    }

    private fun createImageView(props: Map<String, Any?>): View {
        return ImageView(context)
    }

    private fun createDefaultView(props: Map<String, Any?>): View {
        return View(context)
    }
}
