package com.dualler.core.error

import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertTrue

class DuallerErrorHandlerTest {
    @Test
    fun testErrorCallback() {
        val handler = DuallerErrorHandler()
        var received: ErrorInfo? = null
        handler.registerErrorCallback { received = it }
        handler.onError(ErrorInfo("test error", "stack", "pages/index"))
        assertEquals("test error", received?.message)
    }

    @Test
    fun testClear() {
        val handler = DuallerErrorHandler()
        var called = false
        handler.registerErrorCallback { called = true }
        handler.clear()
        handler.onError(ErrorInfo("test"))
        assertTrue(!called)
    }
}
