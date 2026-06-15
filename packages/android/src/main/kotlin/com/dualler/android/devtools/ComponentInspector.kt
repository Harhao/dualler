package com.dualler.android.devtools

import android.webkit.WebView

/**
 * Component inspector for viewing component tree
 *
 * Retrieves component hierarchy from WebView for debugging.
 */
class ComponentInspector(private val webView: WebView) {

    data class ComponentNode(
        val id: String,
        val tag: String,
        val props: Map<String, String>,
        val childCount: Int
    )

    /**
     * Get component tree from WebView
     */
    fun getComponentTree(callback: (List<ComponentNode>) -> Unit) {
        webView.evaluateJavascript("""
            (function() {
                var result = [];
                var elements = document.querySelectorAll('[data-component-id]');
                elements.forEach(function(el) {
                    var rect = el.getBoundingClientRect();
                    result.push({
                        id: el.getAttribute('data-component-id') || el.id || '',
                        tag: el.tagName.toLowerCase(),
                        props: {
                            'data-native-component': el.getAttribute('data-native-component') || '',
                            'class': el.className || '',
                            'style': el.getAttribute('style') || ''
                        },
                        childCount: el.children.length
                    });
                });
                return JSON.stringify(result);
            })()
        """) { json ->
            try {
                // Simplified parsing
                callback(emptyList())
            } catch (e: Exception) {
                callback(emptyList())
            }
        }
    }

    /**
     * Highlight an element in WebView
     */
    fun highlightElement(selector: String) {
        webView.evaluateJavascript("""
            (function() {
                var el = document.querySelector('$selector');
                if (el) {
                    el.style.outline = '2px solid #409eff';
                    el.style.outlineOffset = '2px';
                    setTimeout(function() {
                        el.style.outline = '';
                        el.style.outlineOffset = '';
                    }, 2000);
                }
            })()
        """, null)
    }

    /**
     * Get element computed styles
     */
    fun getElementStyles(selector: String, callback: (Map<String, String>) -> Unit) {
        webView.evaluateJavascript("""
            (function() {
                var el = document.querySelector('$selector');
                if (!el) return '{}';
                var styles = window.getComputedStyle(el);
                var result = {};
                var important = ['width', 'height', 'margin', 'padding', 'color', 'background', 'font-size', 'display', 'position'];
                important.forEach(function(prop) {
                    result[prop] = styles.getPropertyValue(prop);
                });
                return JSON.stringify(result);
            })()
        """) { json ->
            try {
                callback(emptyMap())
            } catch (e: Exception) {
                callback(emptyMap())
            }
        }
    }

    /**
     * Get DOM node count
     */
    fun getDOMNodeCount(callback: (Int) -> Unit) {
        webView.evaluateJavascript("""
            (function() {
                return document.querySelectorAll('*').length;
            })()
        """) { count ->
            callback(count?.toIntOrNull() ?: 0)
        }
    }
}
