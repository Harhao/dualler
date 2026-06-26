package com.dualler.core

import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertTrue

class UrlParserTest {

    @Test
    fun testParseSimplePath() {
        val result = UrlParser.parse("pages/index/index")
        assertEquals("pages/index/index", result.path)
        assertTrue(result.query.isEmpty())
    }

    @Test
    fun testParsePathWithLeadingSlash() {
        val result = UrlParser.parse("/pages/detail/detail")
        assertEquals("pages/detail/detail", result.path)
    }

    @Test
    fun testParsePathWithQuery() {
        val result = UrlParser.parse("/pages/detail/detail?id=1&title=hello")
        assertEquals("pages/detail/detail", result.path)
        assertEquals("1", result.query["id"])
        assertEquals("hello", result.query["title"])
    }

    @Test
    fun testParsePathWithEncodedQuery() {
        val result = UrlParser.parse("/pages/detail/detail?name=hello%20world")
        assertEquals("pages/detail/detail", result.path)
        assertEquals("hello world", result.query["name"])
    }

    @Test
    fun testParsePathWithEmptyQuery() {
        val result = UrlParser.parse("/pages/detail/detail?")
        assertEquals("pages/detail/detail", result.path)
        assertTrue(result.query.isEmpty())
    }

    @Test
    fun testParsePathWithSingleQueryParam() {
        val result = UrlParser.parse("/pages/profile/profile?userId=123")
        assertEquals("pages/profile/profile", result.path)
        assertEquals("123", result.query["userId"])
    }

    @Test
    fun testParsePathWithTrailingSlash() {
        val result = UrlParser.parse("/pages/index/index/")
        assertEquals("pages/index/index", result.path)
    }

    @Test
    fun testParsePathWithMultipleQueryParams() {
        val result = UrlParser.parse("/pages/detail/detail?id=1&title=test&from=home")
        assertEquals("pages/detail/detail", result.path)
        assertEquals(3, result.query.size)
        assertEquals("1", result.query["id"])
        assertEquals("test", result.query["title"])
        assertEquals("home", result.query["from"])
    }
}
