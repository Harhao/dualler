package com.dualler.sdk.protocol

import kotlinx.serialization.Serializable

@Serializable
data class VNode(
    val type: NodeType,
    val tag: String,
    val props: Map<String, Any?>?,
    val children: List<VNode>,
    val parent: VNode? = null,
    val key: Any? = null
)
