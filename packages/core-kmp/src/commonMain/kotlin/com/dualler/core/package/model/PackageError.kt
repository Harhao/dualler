package com.dualler.core.`package`.model

sealed class PackageError(val message: String) {
    class DownloadFailed(message: String) : PackageError(message)
    class PatchFailed(message: String) : PackageError(message)
    class VerifyFailed(message: String) : PackageError(message)
    class InsufficientSpace(message: String) : PackageError(message)
    class VersionTooOld(message: String) : PackageError(message)
}

interface PackageCallback {
    fun onProgress(appId: String, progress: Int)
    fun onSuccess(appId: String, localPackage: LocalPackage)
    fun onFailed(appId: String, error: PackageError)
}
