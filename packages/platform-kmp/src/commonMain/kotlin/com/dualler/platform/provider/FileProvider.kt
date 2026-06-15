package com.dualler.platform.provider

/**
 * File system interface
 */
interface FileProvider {
    fun readFile(path: String, encoding: String = "utf8"): String?
    fun readFileBytes(path: String): ByteArray?
    fun writeFile(path: String, data: String, encoding: String = "utf8"): Boolean
    fun writeFileBytes(path: String, data: ByteArray): Boolean
    fun appendFile(path: String, data: String): Boolean
    fun unlink(path: String): Boolean
    fun mkdir(path: String, recursive: Boolean = true): Boolean
    fun readdir(path: String): List<FileInfo>?
    fun stat(path: String): FileInfo?
    fun saveFile(tempPath: String, destPath: String): String?
}

data class FileInfo(
    val path: String,
    val size: Long,
    val isDirectory: Boolean,
    val lastModified: Long
)
