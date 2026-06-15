package com.dualler.core.`package`

import com.dualler.core.`package`.model.*
import com.dualler.platform.Platform

interface ServerApi {
    fun checkUpdate(appId: String, localVersion: String?, callback: (UpdateCheckResult) -> Unit)
}

class UpdateScheduler(
    private val platform: Platform,
    private val downloader: PackageDownloader,
    private val patcher: PackagePatcher,
    private val cacheStore: PackageCacheStore
) {
    fun checkAndUpdate(appId: String, serverApi: ServerApi, strategy: UpdateStrategy, callback: PackageCallback) {
        val localPackage = cacheStore.getLocalPackage(appId)
        serverApi.checkUpdate(appId, localPackage?.version) { result ->
            when (result) {
                is UpdateCheckResult.UpToDate -> {
                    localPackage?.let { callback.onSuccess(appId, it) }
                        ?: callback.onFailed(appId, PackageError.DownloadFailed("No local package"))
                }
                is UpdateCheckResult.HasUpdate -> doFullUpdate(appId, result.packageInfo, callback)
                is UpdateCheckResult.Error -> {
                    localPackage?.let { callback.onSuccess(appId, it) }
                        ?: callback.onFailed(appId, PackageError.DownloadFailed(result.message))
                }
            }
        }
    }

    private fun doFullUpdate(appId: String, info: PackageInfo, callback: PackageCallback) {
        callback.onProgress(appId, 0)
        val destPath = cacheStore.getInstallPath(appId, info.version) + ".mpkg"
        downloader.download(info.downloadUrl, destPath) { result ->
            when (result) {
                is PackageDownloadResult.Progress -> callback.onProgress(appId, (result.percent * 0.8).toInt())
                is PackageDownloadResult.Success -> {
                    cacheStore.setCurrentVersion(appId, info.version)
                    callback.onProgress(appId, 100)
                    callback.onSuccess(appId, LocalPackage(appId, info.version, destPath, 0, PackageStatus.READY))
                }
                is PackageDownloadResult.Failed -> callback.onFailed(appId, PackageError.DownloadFailed(result.reason))
            }
        }
    }
}
