package com.dualler.platform.provider

/**
 * Local storage interface
 */
interface StorageProvider {
    fun getItem(key: String): String?
    fun setItem(key: String, value: String)
    fun removeItem(key: String)
    fun clear()
    fun getKeys(): List<String>
    fun getInfo(): StorageInfo
}

data class StorageInfo(
    val keys: List<String>,
    val currentSize: Long,
    val limitSize: Long
)
