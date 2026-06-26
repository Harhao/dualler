package com.dualler.android.api

import com.dualler.core.Router
import com.dualler.platform.APIHandler
import com.dualler.platform.model.APIResult

/**
 * Handler for wx.navigateTo({ url: '/pages/detail/detail?id=1' })
 *
 * The URL format is: /pages/path?key1=value1&key2=value2
 * Query parameters are parsed by the Router's UrlParser.
 */
class NavigateToHandler(private val router: Router) : APIHandler {
    override fun invoke(params: Map<String, Any>, callback: (APIResult) -> Unit) {
        val url = params["url"] as? String ?: run {
            callback(APIResult.Fail(-1, "url is required"))
            return
        }
        // Router.navigateTo(url) handles URL parsing internally
        router.navigateTo(url)
        callback(APIResult.Success(mapOf("errMsg" to "navigateTo:ok")))
    }
}

/**
 * Handler for wx.navigateBack({ delta: 1 })
 */
class NavigateBackHandler(private val router: Router) : APIHandler {
    override fun invoke(params: Map<String, Any>, callback: (APIResult) -> Unit) {
        val delta = (params["delta"] as? Number)?.toInt() ?: 1
        router.navigateBack(delta)
        callback(APIResult.Success(mapOf("errMsg" to "navigateBack:ok")))
    }
}

/**
 * Handler for wx.redirectTo({ url: '/pages/path' })
 */
class RedirectToHandler(private val router: Router) : APIHandler {
    override fun invoke(params: Map<String, Any>, callback: (APIResult) -> Unit) {
        val url = params["url"] as? String ?: run {
            callback(APIResult.Fail(-1, "url is required"))
            return
        }
        router.redirectTo(url)
        callback(APIResult.Success(mapOf("errMsg" to "redirectTo:ok")))
    }
}

/**
 * Handler for wx.reLaunch({ url: '/pages/path' })
 */
class ReLaunchHandler(private val router: Router) : APIHandler {
    override fun invoke(params: Map<String, Any>, callback: (APIResult) -> Unit) {
        val url = params["url"] as? String ?: run {
            callback(APIResult.Fail(-1, "url is required"))
            return
        }
        router.reLaunch(url)
        callback(APIResult.Success(mapOf("errMsg" to "reLaunch:ok")))
    }
}
