package com.dualler.platform.model

import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertTrue

class JSValueTest {
    @Test
    fun testStringConversion() {
        val value = JSValue.KString("hello")
        assertEquals("hello", value.toKotlinString())
    }

    @Test
    fun testNumberConversion() {
        val value = JSValue.KNumber(42.0)
        assertEquals(42, value.toInt())
        assertEquals(42.0, value.toDouble())
    }

    @Test
    fun testBooleanConversion() {
        val value = JSValue.KBoolean(true)
        assertTrue(value.toBoolean())
    }

    @Test
    fun testNullAndUndefined() {
        assertTrue(JSValue.Null.isNullOrUndefined())
        assertTrue(JSValue.Undefined.isNullOrUndefined())
    }
}
