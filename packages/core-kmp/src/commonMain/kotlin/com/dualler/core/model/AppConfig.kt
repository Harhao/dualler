package com.dualler.core.model

import kotlinx.serialization.Serializable

/**
 * Mini-program configuration
 */
@Serializable
data class AppConfig(
    val appId: String,
    val appName: String,
    val pages: List<String>,
    val window: WindowConfig = WindowConfig(),
    val tabBar: TabBarConfig? = null,
    val maxStackSize: Int = 5  // Maximum page stack depth
)

@Serializable
data class WindowConfig(
    val backgroundColor: String = "#ffffff",
    val navigationBarTitleText: String = "",
    val navigationBarBackgroundColor: String = "#000000",
    val navigationBarTextStyle: String = "white",
    val enablePullDownRefresh: Boolean = false
)

@Serializable
data class TabBarConfig(
    val color: String,
    val selectedColor: String,
    val backgroundColor: String,
    val list: List<TabBarItem>
)

@Serializable
data class TabBarItem(
    val pagePath: String,
    val text: String,
    val iconPath: String,
    val selectedIconPath: String
)
