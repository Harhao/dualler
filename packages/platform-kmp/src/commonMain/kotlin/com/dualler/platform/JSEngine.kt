package com.dualler.platform

import com.dualler.platform.model.JSArray
import com.dualler.platform.model.JSValue

/**
 * JS Engine abstraction
 * Implementations: QuickJSEngine (Android), JSCoreEngine (iOS), WebWorkerJSEngine (Web)
 */
interface JSEngine {
    /**
     * Execute JS script
     * @param script JS script content
     * @param sourceUrl Source identifier for error stack traces
     * @return Execution result
     */
    fun evaluateScript(script: String, sourceUrl: String = "dualler://inline"): JSValue

    /**
     * Register Kotlin callback to JS global object
     * @param name JS global function name
     * @param callback Callback function
     */
    fun registerCallback(name: String, callback: (JSArray) -> JSValue)

    /**
     * Register Kotlin object to JS
     * @param name JS global object name
     * @param obj Method mapping
     */
    fun registerObject(name: String, obj: Map<String, (JSArray) -> JSValue>)

    /**
     * Destroy engine and release all resources
     */
    fun destroy()
}
