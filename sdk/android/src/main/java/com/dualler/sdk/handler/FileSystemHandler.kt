package com.dualler.sdk.handler

import com.dualler.sdk.protocol.APIContract
import com.dualler.sdk.protocol.BridgeMessage
import com.dualler.sdk.protocol.SandboxPaths
import android.content.Context
import java.io.File

class FileSystemHandler(private val context: Context) : Handler {
    override val apiName: String = APIContract.GET_STORAGE

    private val baseDir: File by lazy {
        File(context.filesDir, SandboxPaths.FILE_DIR).apply { mkdirs() }
    }

    override fun handle(message: BridgeMessage): String? {
        val payload = message.payload as? Map<*, *> ?: return null
        val path = payload["path"] as? String ?: return null
        val fullPath = File(baseDir, path).absolutePath

        return when (message.type.name) {
            "READ" -> {
                val content = File(fullPath).readText()
                """{"data":"$content"}"""
            }
            "WRITE" -> {
                val data = payload["data"] as? String ?: ""
                File(fullPath).writeText(data)
                "{}"
            }
            "STAT" -> {
                val file = File(fullPath)
                """{"isDir":${file.isDirectory},"size":${file.length()}}"""
            }
            else -> "{}"
        }
    }
}
