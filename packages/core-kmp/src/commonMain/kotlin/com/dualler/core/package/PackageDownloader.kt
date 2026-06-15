package com.dualler.core.`package`

import com.dualler.platform.Platform
import com.dualler.platform.provider.DownloadConfig
import com.dualler.platform.provider.DownloadProgress

sealed class PackageDownloadResult {
    data class Progress(val percent: Int, val bytes: Long) : PackageDownloadResult()
    data class Success(val filePath: String) : PackageDownloadResult()
    data class Failed(val reason: String) : PackageDownloadResult()
}

class PackageDownloader(private val platform: Platform) {
    fun download(url: String, destPath: String, callback: (PackageDownloadResult) -> Unit) {
        callback(PackageDownloadResult.Progress(0, 0))
        platform.network.downloadFile(DownloadConfig(url = url, filePath = destPath)) { result ->
            when (result) {
                is DownloadProgress.Progress -> callback(PackageDownloadResult.Progress(result.percent, result.bytes))
                is DownloadProgress.Success -> callback(PackageDownloadResult.Success(result.filePath))
                is DownloadProgress.Failed -> callback(PackageDownloadResult.Failed(result.error))
            }
        }
    }
}
