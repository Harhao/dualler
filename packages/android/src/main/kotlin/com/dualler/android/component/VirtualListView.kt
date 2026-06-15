package com.dualler.android.component

import android.content.Context
import android.view.View
import android.view.ViewGroup
import android.webkit.WebView
import android.widget.FrameLayout

/**
 * Virtual list view for Android
 *
 * Renders only visible items in a scrollable container.
 * Recycles off-screen views to minimize DOM/memory usage.
 */
class VirtualListView(
    private val context: Context,
    private val webView: WebView
) {
    private var containerId: String = ""
    private var itemHeight: Int = 0
    private var bufferSize: Int = 5
    private var dataList: List<Any> = emptyList()
    private var renderedStart: Int = -1
    private var renderedEnd: Int = -1

    /**
     * Initialize virtual list in WebView
     */
    fun init(containerId: String, itemHeight: Int, bufferSize: Int = 5) {
        this.containerId = containerId
        this.itemHeight = itemHeight
        this.bufferSize = bufferSize

        // Inject virtual list JS engine into WebView
        val js = """
            window.__dualler_virtual_list__ = {
                instances: {},

                init: function(containerId, config) {
                    var container = document.getElementById(containerId);
                    if (!container) return;

                    var totalHeight = config.list.length * config.itemHeight;
                    var visibleCount = Math.ceil((config.containerHeight || window.innerHeight) / config.itemHeight);
                    var bufferCount = config.bufferSize || 5;

                    container.style.overflow = 'auto';
                    container.style.position = 'relative';

                    // Create placeholder for scroll height
                    var placeholder = document.createElement('div');
                    placeholder.style.height = totalHeight + 'px';
                    placeholder.style.position = 'relative';
                    container.appendChild(placeholder);

                    var instance = {
                        container: container,
                        placeholder: placeholder,
                        config: config,
                        visibleCount: visibleCount,
                        bufferCount: bufferCount,
                        renderedStart: -1,
                        renderedEnd: -1,
                        renderedItems: {}
                    };

                    this.instances[containerId] = instance;

                    // Listen to scroll
                    container.addEventListener('scroll', function() {
                        requestAnimationFrame(function() {
                            __dualler_virtual_list__.renderVisible(containerId, container.scrollTop);
                        });
                    });

                    // Initial render
                    this.renderVisible(containerId, 0);
                },

                renderVisible: function(containerId, scrollTop) {
                    var inst = this.instances[containerId];
                    if (!inst) return;

                    var start = Math.floor(scrollTop / inst.config.itemHeight);
                    var end = Math.min(start + inst.visibleCount + inst.bufferCount, inst.config.list.length);
                    start = Math.max(0, start - inst.bufferCount);

                    if (start === inst.renderedStart && end === inst.renderedEnd) return;
                    inst.renderedStart = start;
                    inst.renderedEnd = end;

                    // Remove off-screen items
                    for (var key in inst.renderedItems) {
                        var idx = parseInt(key);
                        if (idx < start || idx >= end) {
                            inst.renderedItems[key].remove();
                            delete inst.renderedItems[key];
                        }
                    }

                    // Add visible items
                    for (var i = start; i < end; i++) {
                        if (!inst.renderedItems[i]) {
                            var item = inst.config.list[i];
                            var el = inst.config.renderItem(item, i);
                            el.style.position = 'absolute';
                            el.style.top = (i * inst.config.itemHeight) + 'px';
                            el.style.width = '100%';
                            inst.placeholder.appendChild(el);
                            inst.renderedItems[i] = el;
                        }
                    }
                },

                updateData: function(containerId, newList) {
                    var inst = this.instances[containerId];
                    if (!inst) return;
                    inst.config.list = newList;
                    var totalHeight = newList.length * inst.config.itemHeight;
                    inst.placeholder.style.height = totalHeight + 'px';
                    // Re-render
                    inst.renderedStart = -1;
                    inst.renderedEnd = -1;
                    this.renderVisible(containerId, inst.container.scrollTop);
                },

                scrollToIndex: function(containerId, index) {
                    var inst = this.instances[containerId];
                    if (!inst) return;
                    inst.container.scrollTop = index * inst.config.itemHeight;
                },

                destroy: function(containerId) {
                    var inst = this.instances[containerId];
                    if (inst) {
                        inst.placeholder.innerHTML = '';
                        delete this.instances[containerId];
                    }
                }
            };
        """.trimIndent()

        webView.evaluateJavascript(js, null)
    }

    /**
     * Set list data and render
     */
    fun setData(list: List<Any>, renderItemJs: String) {
        this.dataList = list

        val listJson = org.json.JSONArray(list.map { it.toString() }).toString()
        val config = """
            {
                list: $listJson,
                itemHeight: $itemHeight,
                bufferSize: $bufferSize,
                containerHeight: window.innerHeight,
                renderItem: $renderItemJs
            }
        """.trimIndent()

        webView.evaluateJavascript(
            "__dualler_virtual_list__.init('$containerId', $config)",
            null
        )
    }

    /**
     * Update list data
     */
    fun updateData(list: List<Any>) {
        this.dataList = list
        val listJson = org.json.JSONArray(list.map { it.toString() }).toString()
        webView.evaluateJavascript(
            "__dualler_virtual_list__.updateData('$containerId', $listJson)",
            null
        )
    }

    /**
     * Scroll to index
     */
    fun scrollToIndex(index: Int) {
        webView.evaluateJavascript(
            "__dualler_virtual_list__.scrollToIndex('$containerId', $index)",
            null
        )
    }

    /**
     * Destroy
     */
    fun destroy() {
        webView.evaluateJavascript(
            "__dualler_virtual_list__.destroy('$containerId')",
            null
        )
    }
}
