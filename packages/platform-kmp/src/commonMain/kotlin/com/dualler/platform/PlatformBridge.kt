package com.dualler.platform

import com.dualler.platform.model.APIResult
import com.dualler.platform.model.DOMEvent

/**
 * Platform Bridge abstraction
 * Coordinates communication between logic layer, render layer, and native layer
 */
interface PlatformBridge {
    /**
     * Logic layer -> Render layer: data update
     */
    fun setData(pageId: String, data: Map<String, Any>)

    /**
     * Render layer -> Logic layer: event dispatch
     */
    fun dispatchEvent(pageId: String, event: DOMEvent)

    /**
     * Logic layer -> Native: API call
     */
    fun callNative(api: String, params: Map<String, Any>, callbackId: String)

    /**
     * Native -> Logic layer: callback
     */
    fun invokeCallback(callbackId: String, result: APIResult)

    /**
     * Register system API handler
     */
    fun registerAPI(name: String, handler: APIHandler)
}

/**
 * System API handler interface
 */
interface APIHandler {
    fun invoke(params: Map<String, Any>, callback: (APIResult) -> Unit)
}