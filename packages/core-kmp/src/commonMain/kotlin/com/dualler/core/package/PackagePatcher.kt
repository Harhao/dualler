package com.dualler.core.`package`

import com.dualler.platform.Platform

sealed class PatchResult {
    data class Success(val outputPath: String, val newVersion: String) : PatchResult()
    data class Failed(val reason: String) : PatchResult()
}

class PackagePatcher(private val platform: Platform) {
    fun applyPatch(basePath: String, patchPath: String, outputPath: String): PatchResult {
        return try {
            val baseData = platform.file.readFileBytes(basePath)
                ?: return PatchResult.Failed("Cannot read base file")
            platform.file.writeFileBytes(outputPath, baseData)
            PatchResult.Success(outputPath, "patched")
        } catch (e: Exception) {
            PatchResult.Failed(e.message ?: "Unknown error")
        }
    }
}
