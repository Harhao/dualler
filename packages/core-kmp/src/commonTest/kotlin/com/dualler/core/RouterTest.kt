package com.dualler.core

import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertNull

class RouterTest {
    @Test
    fun testNavigateTo() {
        val platform = MockPlatform()
        val router = Router(platform)
        router.navigateTo("pages/index")
        assertEquals("pages/index", router.currentPath)
        assertEquals(1, router.stackSize)
    }

    @Test
    fun testNavigateToMultiple() {
        val platform = MockPlatform()
        val router = Router(platform)
        router.navigateTo("pages/index")
        router.navigateTo("pages/detail")
        assertEquals("pages/detail", router.currentPath)
        assertEquals(2, router.stackSize)
    }

    @Test
    fun testNavigateBack() {
        val platform = MockPlatform()
        val router = Router(platform)
        router.navigateTo("pages/index")
        router.navigateTo("pages/detail")
        router.navigateBack()
        assertEquals("pages/index", router.currentPath)
        assertEquals(1, router.stackSize)
    }

    @Test
    fun testRedirectTo() {
        val platform = MockPlatform()
        val router = Router(platform)
        router.navigateTo("pages/index")
        router.redirectTo("pages/detail")
        assertEquals("pages/detail", router.currentPath)
        assertEquals(1, router.stackSize)
    }

    @Test
    fun testReLaunch() {
        val platform = MockPlatform()
        val router = Router(platform)
        router.navigateTo("pages/index")
        router.navigateTo("pages/detail")
        router.reLaunch("pages/profile")
        assertEquals("pages/profile", router.currentPath)
        assertEquals(1, router.stackSize)
    }

    @Test
    fun testClear() {
        val platform = MockPlatform()
        val router = Router(platform)
        router.navigateTo("pages/index")
        router.navigateTo("pages/detail")
        router.clear()
        assertNull(router.currentPage)
        assertEquals(0, router.stackSize)
    }
}
