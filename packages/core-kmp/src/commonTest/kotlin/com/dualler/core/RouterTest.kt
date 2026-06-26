package com.dualler.core

import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertNull
import kotlin.test.assertTrue

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

    // === Stack depth limit tests ===

    @Test
    fun testStackLimitReached() {
        val platform = MockPlatform()
        val router = Router(platform, maxStackSize = 5)

        // Navigate to 5 pages
        router.navigateTo("pages/1")
        router.navigateTo("pages/2")
        router.navigateTo("pages/3")
        router.navigateTo("pages/4")
        router.navigateTo("pages/5")
        assertEquals(5, router.stackSize)
        assertEquals("pages/5", router.currentPath)

        // 6th page should trigger stack trimming
        router.navigateTo("pages/6")
        assertEquals(5, router.stackSize)  // Still max 5
        assertEquals("pages/6", router.currentPath)
    }

    @Test
    fun testStackLimitBottomPagesDestroyed() {
        val platform = MockPlatform()
        val router = Router(platform, maxStackSize = 5)

        // Fill stack to max
        router.navigateTo("pages/1")
        router.navigateTo("pages/2")
        router.navigateTo("pages/3")
        router.navigateTo("pages/4")
        router.navigateTo("pages/5")

        // Navigate one more - should destroy pages/1
        router.navigateTo("pages/6")
        assertEquals(5, router.stackSize)

        // Navigate back should go to pages/5 (pages/1 was destroyed)
        router.navigateBack()
        assertEquals("pages/5", router.currentPath)
        assertEquals(4, router.stackSize)
    }

    @Test
    fun testStackLimitWithCustomSize() {
        val platform = MockPlatform()
        val router = Router(platform, maxStackSize = 3)

        router.navigateTo("pages/1")
        router.navigateTo("pages/2")
        router.navigateTo("pages/3")
        assertEquals(3, router.stackSize)

        // 4th page triggers trim
        router.navigateTo("pages/4")
        assertEquals(3, router.stackSize)
        assertEquals("pages/4", router.currentPath)
    }

    @Test
    fun testNavigateBackAfterStackTrim() {
        val platform = MockPlatform()
        val router = Router(platform, maxStackSize = 3)

        router.navigateTo("pages/1")
        router.navigateTo("pages/2")
        router.navigateTo("pages/3")
        router.navigateTo("pages/4")  // pages/1 should be trimmed

        // Stack should be: [pages/2, pages/3, pages/4]
        assertEquals(3, router.stackSize)
        assertEquals("pages/4", router.currentPath)

        router.navigateBack()
        assertEquals("pages/3", router.currentPath)

        router.navigateBack()
        assertEquals("pages/2", router.currentPath)
    }

    @Test
    fun testRedirectToDoesNotExceedLimit() {
        val platform = MockPlatform()
        val router = Router(platform, maxStackSize = 3)

        router.navigateTo("pages/1")
        router.navigateTo("pages/2")
        router.navigateTo("pages/3")

        // Redirect replaces top, doesn't add
        router.redirectTo("pages/new")
        assertEquals(3, router.stackSize)
        assertEquals("pages/new", router.currentPath)
    }

    @Test
    fun testReLaunchResetsStack() {
        val platform = MockPlatform()
        val router = Router(platform, maxStackSize = 3)

        router.navigateTo("pages/1")
        router.navigateTo("pages/2")
        router.navigateTo("pages/3")
        router.reLaunch("pages/home")

        assertEquals(1, router.stackSize)
        assertEquals("pages/home", router.currentPath)
    }

    @Test
    fun testDefaultMaxStackSize() {
        val platform = MockPlatform()
        val router = Router(platform)

        // Default is 5
        assertEquals(Router.DEFAULT_MAX_STACK_SIZE, 5)

        // Can navigate up to 5
        for (i in 1..5) {
            router.navigateTo("pages/$i")
        }
        assertEquals(5, router.stackSize)

        // 6th triggers trim
        router.navigateTo("pages/6")
        assertEquals(5, router.stackSize)
    }

    // === URL-based navigation tests ===

    @Test
    fun testNavigateToWithUrl() {
        val platform = MockPlatform()
        val router = Router(platform)
        router.navigateTo("/pages/detail/detail?id=1&title=test")
        assertEquals("pages/detail/detail", router.currentPath)
        assertEquals("1", router.getCurrentQuery()["id"])
        assertEquals("test", router.getCurrentQuery()["title"])
    }

    @Test
    fun testRedirectToWithUrl() {
        val platform = MockPlatform()
        val router = Router(platform)
        router.navigateTo("pages/index")
        router.redirectTo("/pages/detail/detail?id=2")
        assertEquals("pages/detail/detail", router.currentPath)
        assertEquals("2", router.getCurrentQuery()["id"])
        assertEquals(1, router.stackSize)
    }

    @Test
    fun testReLaunchWithUrl() {
        val platform = MockPlatform()
        val router = Router(platform)
        router.navigateTo("pages/index")
        router.navigateTo("pages/detail")
        router.reLaunch("/pages/home?from=splash")
        assertEquals("pages/home", router.currentPath)
        assertEquals("splash", router.getCurrentQuery()["from"])
        assertEquals(1, router.stackSize)
    }
}
