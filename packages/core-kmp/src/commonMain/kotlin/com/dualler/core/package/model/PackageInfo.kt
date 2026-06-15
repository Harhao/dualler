package com.dualler.core.`package`.model

import kotlinx.serialization.Serializable

@Serializable
data class PackageInfo(
    val appId: String,
    val version: String,
    val baseVersion: String,
    val packageSize: Long,
    val sha256: String,
    val downloadUrl: String,
    val patchUrl: String? = null,
    val patchBaseVersion: String? = null,
    val patchSha256: String? = null,
    val forceUpdate: Boolean = false,
    val minSupportVersion: String = "1.0.0",
    val releaseNote: String = ""
)

data class LocalPackage(
    val appId: String,
    val version: String,
    val installPath: String,
    val installedAt: Long,
    val status: PackageStatus
)

enum class PackageStatus {
    READY, DOWNLOADING, PATCHING, CORRUPTED, NEED_UPDATE
}

sealed class UpdateCheckResult {
    object UpToDate : UpdateCheckResult()
    data class HasUpdate(val packageInfo: PackageInfo) : UpdateCheckResult()
    data class Error(val message: String) : UpdateCheckResult()
}

enum class UpdateStrategy {
    SILENT, IMMEDIATE, PREFETCH
}
