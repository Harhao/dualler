package com.dualler.core.`package`

import com.dualler.core.MockPlatform
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertNull

class PackageCacheStoreTest {
    @Test
    fun testVersionLifecycle() {
        val platform = MockPlatform()
        val store = PackageCacheStore(platform)
        assertNull(store.getCurrentVersion("com.test.app"))
        store.setCurrentVersion("com.test.app", "1.0.0")
        assertEquals("1.0.0", store.getCurrentVersion("com.test.app"))
    }

    @Test
    fun testClearCache() {
        val platform = MockPlatform()
        val store = PackageCacheStore(platform)
        store.setCurrentVersion("com.test.app", "1.0.0")
        store.clearCache("com.test.app")
        assertNull(store.getCurrentVersion("com.test.app"))
    }
}
