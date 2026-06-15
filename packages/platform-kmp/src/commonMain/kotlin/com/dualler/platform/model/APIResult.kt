package com.dualler.platform.model

/**
 * API execution result
 */
sealed class APIResult {
    data class Success(val data: Any) : APIResult()
    data class Fail(val errCode: Int, val errMsg: String) : APIResult()
}