package com.dualler.sdk.view

import android.content.Context
import android.view.View
import com.dualler.sdk.protocol.NodeType
import com.dualler.sdk.protocol.VNode

/**
 * Renders VNode tree to native Android views.
 */
class WebViewRenderer(private val context: Context) {
    private val viewManager = ViewManager(context)

    fun render(node: VNode): View {
        return renderNode(node)
    }

    private fun renderNode(node: VNode): View {
        return when (node.type) {
            NodeType.ELEMENT -> viewManager.createView(node.tag, node.props ?: emptyMap())
            NodeType.TEXT -> {
                val tv = viewManager.createTextView(emptyMap()) as TextView
                tv.text = node.tag // for text nodes, tag holds content
                tv
            }
            NodeType.FRAGMENT, NodeType.COMMENT -> View(context)
        }
    }

    fun patch(existingView: View?, instruction: PatchInstruction) {
        // Apply a single patch instruction to the view tree
    }
}

data class PatchInstruction(
    val op: String,      // "add", "update", "remove", "move"
    val path: String,
    val value: Any? = null
)
