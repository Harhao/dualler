package com.dualler.sdk.protocol

import kotlinx.serialization.Serializable

@Serializable
data class DSLNode(
    val type: NodeType,
    val tag: String,
    val props: Map<String, Any?> = emptyMap(),
    val children: List<DSLNode> = emptyList(),
    val key: Any? = null
)

enum class NodeType { ELEMENT, TEXT, FRAGMENT, COMMENT }
