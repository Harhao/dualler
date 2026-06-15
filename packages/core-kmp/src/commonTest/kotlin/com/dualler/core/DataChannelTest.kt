package com.dualler.core

import kotlin.test.Test
import kotlin.test.assertEquals

class DataChannelTest {
    @Test
    fun testSyncData() {
        val platform = MockPlatform()
        val channel = DataChannel(platform.bridge)

        channel.syncData("pages/index", mapOf("count" to 1))

        assertEquals(1, platform.bridge.setDataCalls.size)
        assertEquals("pages/index", platform.bridge.setDataCalls[0].first)
    }

    @Test
    fun testSetPathData() {
        val platform = MockPlatform()
        val channel = DataChannel(platform.bridge)

        channel.setPathData("pages/index", "list[0].name", "test")

        assertEquals(1, platform.bridge.setDataCalls.size)
        assertEquals("pages/index", platform.bridge.setDataCalls[0].first)
    }
}
