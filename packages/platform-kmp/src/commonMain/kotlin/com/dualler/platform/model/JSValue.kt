package com.dualler.platform.model

import kotlinx.serialization.KSerializer
import kotlinx.serialization.encoding.Decoder
import kotlinx.serialization.encoding.Encoder
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonArray
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.buildJsonArray
import kotlinx.serialization.json.buildJsonObject

/**
 * JS value type sealed class for Kotlin-JS type safety
 */
sealed class JSValue {
    object Undefined : JSValue()
    object Null : JSValue()
    data class KBoolean(val value: Boolean) : JSValue()
    data class KNumber(val value: Double) : JSValue()
    data class KString(val value: String) : JSValue()
    data class KArray(val elements: List<JSValue>) : JSValue()
    data class KObject(val properties: Map<String, JSValue>) : JSValue()

    fun toKotlinString(): String = (this as? KString)?.value ?: ""
    fun toInt(): Int = (this as? KNumber)?.value?.toInt() ?: 0
    fun toDouble(): Double = (this as? KNumber)?.value ?: 0.0
    fun toBoolean(): Boolean = (this as? KBoolean)?.value ?: false
    fun isNullOrUndefined(): Boolean = this is Null || this is Undefined

    fun toJson(): String = Json.encodeToString(serializer, this)

    companion object {
        private val serializer: KSerializer<JSValue> = JSValueSerializer
        fun fromJson(json: String): JSValue = Json.decodeFromString(serializer, json)
    }
}

/**
 * JS array parameter wrapper
 */
data class JSArray(val elements: List<JSValue>) {
    fun getString(index: Int): String = elements[index].toKotlinString()
    fun getInt(index: Int): Int = elements[index].toInt()
    fun getDouble(index: Int): Double = elements[index].toDouble()
    fun getBoolean(index: Int): Boolean = elements[index].toBoolean()
    fun get(index: Int): JSValue = elements[index]
    fun getOrNull(index: Int): JSValue? = elements.getOrNull(index)
    val size: Int get() = elements.size
}

/**
 * JSValue kotlinx.serialization serializer
 */
private object JSValueSerializer : KSerializer<JSValue> {
    override val descriptor = JsonElement.serializer().descriptor

    override fun serialize(encoder: Encoder, value: JSValue) {
        val element = serializeToJsonElement(value)
        encoder.encodeSerializableValue(JsonElement.serializer(), element)
    }

    override fun deserialize(decoder: Decoder): JSValue {
        val element = decoder.decodeSerializableValue(JsonElement.serializer())
        return deserializeFromJsonElement(element)
    }

    private fun serializeToJsonElement(value: JSValue): JsonElement {
        return when (value) {
            is JSValue.Null -> JsonPrimitive(null as String?)
            is JSValue.Undefined -> JsonPrimitive(null as String?)
            is JSValue.KBoolean -> JsonPrimitive(value.value)
            is JSValue.KNumber -> JsonPrimitive(value.value)
            is JSValue.KString -> JsonPrimitive(value.value)
            is JSValue.KArray -> buildJsonArray {
                value.elements.forEach { add(serializeToJsonElement(it)) }
            }
            is JSValue.KObject -> buildJsonObject {
                value.properties.forEach { (k, v) -> put(k, serializeToJsonElement(v)) }
            }
        }
    }

    private fun deserializeFromJsonElement(element: JsonElement): JSValue {
        return when {
            element is JsonPrimitive && element.isString -> JSValue.KString(element.content)
            element is JsonPrimitive && element.content == "null" -> JSValue.Null
            element is JsonPrimitive && element.content == "true" -> JSValue.KBoolean(true)
            element is JsonPrimitive && element.content == "false" -> JSValue.KBoolean(false)
            element is JsonPrimitive -> {
                element.content.toDoubleOrNull()?.let { JSValue.KNumber(it) }
                    ?: JSValue.KString(element.content)
            }
            element is JsonArray -> {
                JSValue.KArray(element.map { deserializeFromJsonElement(it) })
            }
            element is JsonObject -> {
                JSValue.KObject(element.mapValues { (_, v) -> deserializeFromJsonElement(v) })
            }
            else -> JSValue.Null
        }
    }
}
