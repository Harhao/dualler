package com.dualler.android.api

import com.dualler.core.Router
import com.dualler.platform.APIHandler
import com.dualler.platform.model.APIResult

class NavigateToHandler(private val router: Router) : APIHandler {
    override fun invoke(params: Map<String, Any>, callback: (APIResult) -> Unit) {
        val url = params["url"] as? String ?: run {
            callback(APIResult.Fail(-1, "url is required"))
            return
        }
        val query = params["query"] as? Map<String, String> ?: emptyMap()
        router.navigateTo(url, query)
        callback(APIResult.Success(mapOf("errMsg" to "navigateTo:ok")))
    }
}

class NavigateBackHandler(private val router: Router) : APIHandler {
    override fun invoke(params: Map<String, Any>, callback: (APIResult) -> Unit) {
        val delta = (params["delta"] as? Number)?.toInt() ?: 1
        router.navigateBack(delta)
        callback(APIResult.Success(mapOf("errMsg" to "navigateBack:ok")))
    }
}

class RedirectToHandler(private val router: Router) : APIHandler {
    override fun invoke(params: Map<String, Any>, callback: (APIResult) -> Unit) {
        val url = params["url"] as? String ?: run {
            callback(APIResult.Fail(-1, "url is required"))
            return
        }
        val query = params["query"] as? Map<String, String> ?: emptyMap()
        router.redirectTo(url, query)
        callback(APIResult.Success(mapOf("errMsg" to "redirectTo:ok")))
    }
}

class ReLaunchHandler(private val router: Router) : APIHandler {
    override fun invoke(params: Map<String, Any>, callback: (APIResult) -> Unit) {
        val url = params["url"] as? String ?: run {
            callback(APIResult.Fail(-1, "url is required"))
            return
        }
        val query = params["query"] as? Map<String, String> ?: emptyMap()
        router.reLaunch(url, query)
        callback(APIResult.Success(mapOf("errMsg" to "reLaunch:ok")))
    }
}
