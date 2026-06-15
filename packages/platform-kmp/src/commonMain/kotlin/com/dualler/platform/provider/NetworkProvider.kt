package com.dualler.platform.provider

/**
 * Network capability interface
 */
interface NetworkProvider {
    fun request(config: NetworkRequest, callback: (NetworkResponse) -> Unit)
    fun uploadFile(config: UploadConfig, callback: (NetworkResponse) -> Unit)
    fun downloadFile(config: DownloadConfig, callback: (DownloadProgress) -> Unit)
}

data class NetworkRequest(
    val url: String,
    val method: String = "GET",
    val headers: Map<String, String> = emptyMap(),
    val data: String? = null,
    val timeout: Long = 30000
)

data class NetworkResponse(
    val statusCode: Int,
    val header: Map<String, String>,
    val data: String?,
    val cookies: List<String> = emptyList()
)

data class UploadConfig(
    val url: String,
    val filePath: String,
    val name: String,
    val formData: Map<String, String> = emptyMap()
)

data class DownloadConfig(
    val url: String,
    val filePath: String? = null
)

sealed class DownloadProgress {
    data class Progress(val percent: Int, val bytes: Long) : DownloadProgress()
    data class Success(val filePath: String) : DownloadProgress()
    data class Failed(val error: String) : DownloadProgress()
}
