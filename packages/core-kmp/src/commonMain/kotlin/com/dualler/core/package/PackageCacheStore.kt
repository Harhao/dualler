package com.dualler.core.`package`

import com.dualler.core.`package`.model.LocalPackage
import com.dualler.core.`package`.model.PackageStatus
import com.dualler.platform.Platform

class PackageCacheStore(private val platform: Platform) {
    private val storage = platform.storage

    companion object {
        private const val KEY_VERSION_PREFIX = "dualler_version_"
    }

    fun getCurrentVersion(appId: String): String? {
        return storage.getItem("$KEY_VERSION_PREFIX$appId")
    }

    fun setCurrentVersion(appId: String, version: String) {
        storage.setItem("$KEY_VERSION_PREFIX$appId", version)
    }

    fun getLocalPackage(appId: String): LocalPackage? {
        val version = getCurrentVersion(appId) ?: return null
        return LocalPackage(
            appId = appId,
            version = version,
            installPath = getInstallPath(appId, version),
            installedAt = 0,
            status = PackageStatus.READY
        )
    }

    fun getInstallPath(appId: String, version: String): String {
        return "dualler/packages/$appId/v$version"
    }

    fun cleanOldVersions(appId: String, keepVersions: Int = 2) {}

    fun clearCache(appId: String) {
        storage.removeItem("$KEY_VERSION_PREFIX$appId")
    }

    fun clearAllCache() {
        storage.clear()
    }
}
