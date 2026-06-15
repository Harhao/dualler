package com.dualler.platform.model

import kotlinx.serialization.Serializable

/**
 * DOM event data
 */
@Serializable
data class DOMEvent(
    val type: String,           // tap, input, scroll, longpress
    val target: String,         // element selector or ID
    val currentTarget: String,
    val detail: Map<String, String>? = null,
    val timestamp: Long = 0
)