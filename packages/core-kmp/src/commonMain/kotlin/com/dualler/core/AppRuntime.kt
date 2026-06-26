package com.dualler.core

import com.dualler.platform.*
import com.dualler.platform.model.JSValue
import com.dualler.core.model.AppConfig

/**
 * Application-level runtime
 *
 * State machine: CREATED -> LAUNCHING -> RUNNING -> DESTROYING -> DESTROYED
 */
class AppRuntime(
    private val platform: Platform,
    private val config: AppConfig
) {
    private val router = Router(platform, config.maxStackSize)
    private var state = AppState.CREATED

    private lateinit var jsEngine: JSEngine
    private lateinit var bridge: PlatformBridge

    /**
     * Launch mini-program
     */
    suspend fun launch(entryPath: String, query: Map<String, String> = emptyMap()) {
        check(state == AppState.CREATED) { "AppRuntime already launched" }
        state = AppState.LAUNCHING

        // 1. Initialize JS engine
        jsEngine = platform.createJSEngine()
        bridge = platform.createBridge()

        // 2. Inject runtime
        injectRuntime()

        // 3. Load app.js
        val appJs = platform.file.readFile("app.js") ?: ""
        if (appJs.isNotEmpty()) {
            jsEngine.evaluateScript(appJs, "app.js")
        }

        // 4. Register system APIs
        registerSystemAPIs()

        // 5. Open home page
        router.navigateTo(entryPath, query)

        // 6. Trigger onLaunch
        triggerLifecycle("onLaunch", mapOf("path" to entryPath, "query" to query))

        state = AppState.RUNNING
    }

    /**
     * Trigger application lifecycle event
     */
    fun triggerLifecycle(event: String, params: Map<String, Any> = emptyMap()) {
        val json = params.toString()
        jsEngine.evaluateScript("__dualler_app__.$event($json)", "lifecycle://$event")
    }

    /**
     * Destroy mini-program
     */
    fun destroy() {
        state = AppState.DESTROYING
        router.clear()
        jsEngine.destroy()
        state = AppState.DESTROYED
    }

    fun getState(): AppState = state

    private fun injectRuntime() {
        // Inject dualler runtime JS
        jsEngine.evaluateScript(DUALLER_RUNTIME_JS, "dualler://runtime")

        // Inject setData callback
        jsEngine.registerCallback("__dualler_setData") { args ->
            val pageId = args.getString(0)
            val data = args.getString(1)
            JSValue.Undefined
        }

        // Inject callNative callback
        jsEngine.registerCallback("__dualler_callNative") { args ->
            val api = args.getString(0)
            val params = args.getString(1)
            val callbackId = args.getString(2)
            bridge.callNative(api, emptyMap(), callbackId)
            JSValue.Undefined
        }
    }

    private fun registerSystemAPIs() {
        // System API registration will be implemented in later tasks
    }
}

enum class AppState {
    CREATED, LAUNCHING, RUNNING, DESTROYING, DESTROYED
}

/**
 * Dualler runtime JS (injected into QuickJS)
 */
val DUALLER_RUNTIME_JS = """
    var __dualler_pages__ = {};
    var __dualler_app__ = {};
    var __dualler_currentPage__ = null;
    var __dualler_callbacks__ = {};
    var __dualler_callback_id__ = 0;

    function __dualler_ref(value) {
        return { value: value };
    }

    function __dualler_reactive(obj) {
        return obj;
    }

    function __dualler_page__(pageId, options) {
        __dualler_pages__[pageId] = options;
        if (options.setup) {
            var data = options.setup();
            __dualler_pages__[pageId]._data = data;
        }
    }

    function __dualler_event__(pageId, event) {
        var page = __dualler_pages__[pageId];
        if (page && page.methods && page.methods[event.type]) {
            page.methods[event.type].call(page._data, event);
        }
    }

    function __dualler_call(api, params, callback) {
        var id = 'cb_' + (++__dualler_callback_id__);
        if (callback) {
            __dualler_callbacks__[id] = callback;
        }
        __dualler_callNative(api, JSON.stringify(params), id);
    }

    function __dualler_callback__(callbackId, result) {
        var cb = __dualler_callbacks__[callbackId];
        if (cb) {
            cb(result);
            delete __dualler_callbacks__[callbackId];
        }
    }

    var wx = {
        request: function(opts) {
            __dualler_call('request', opts, opts.success);
        },
        navigateTo: function(opts) {
            __dualler_call('navigateTo', opts);
        },
        navigateBack: function(opts) {
            __dualler_call('navigateBack', opts || {});
        }
    };
""".trimIndent()
