import Foundation

// ============================================================
// Platform 协议定义
// ============================================================

/// 平台接口
public protocol Platform {
    var name: String { get }
    func createJSEngine() -> JSEngine
    func createWebView() -> WebViewProvider
    func createBridge() -> PlatformBridge
    var network: NetworkProvider { get }
    var storage: StorageProvider { get }
    var file: FileProvider { get }
    var device: DeviceProvider { get }
}

/// JS 引擎接口
public protocol JSEngine {
    func evaluateScript(_ script: String, sourceUrl: String) -> JSValue
    func registerCallback(_ name: String, callback: @escaping (JSArray) -> JSValue)
    func registerObject(_ name: String, obj: [String: (JSArray) -> JSValue])
    func destroy()
}

/// WebView 接口
public protocol WebViewProvider {
    func loadUrl(_ url: String)
    func loadHtml(_ html: String, baseUrl: String)
    func evaluateJavascript(_ script: String, callback: ((String) -> Void)?)
    func addJavascriptInterface(_ name: String, handler: @escaping (String) -> Void)
    func injectCSS(_ css: String)
    func injectScript(_ script: String)
    func configure(_ config: WebViewConfig)
    func destroy()
}

/// WebView 配置
public struct WebViewConfig {
    public var javaScriptEnabled: Bool = true
    public var domStorageEnabled: Bool = true
    public var allowFileAccess: Bool = false
    public var userAgent: String?
    public var virtualDomain: String = "dualler.local"

    public init() {}
}

/// 平台 Bridge 接口
public protocol PlatformBridge {
    func setData(_ pageId: String, data: [String: Any])
    func dispatchEvent(_ pageId: String, event: DOMEvent)
    func callNative(_ api: String, params: [String: Any], callbackId: String)
    func invokeCallback(_ callbackId: String, result: APIResult)
    func registerAPI(_ name: String, handler: APIHandler)
}

/// API 处理器接口
public protocol APIHandler {
    func invoke(params: [String: Any], callback: @escaping (APIResult) -> Void)
}

/// 网络提供者接口
public protocol NetworkProvider {
    func request(_ config: NetworkRequest, callback: @escaping (NetworkResponse) -> Void)
    func uploadFile(_ config: UploadConfig, callback: @escaping (NetworkResponse) -> Void)
    func downloadFile(_ config: DownloadConfig, callback: @escaping (DownloadResult) -> Void)
}

/// 存储提供者接口
public protocol StorageProvider {
    func getItem(_ key: String) -> String?
    func setItem(_ key: String, value: String)
    func removeItem(_ key: String)
    func clear()
    func getKeys() -> [String]
    func getInfo() -> StorageInfo
}

/// 文件提供者接口
public protocol FileProvider {
    func readFile(_ path: String, encoding: String) -> String?
    func readFileBytes(_ path: String) -> Data?
    func writeFile(_ path: String, data: String, encoding: String) -> Bool
    func writeFileBytes(_ path: String, data: Data) -> Bool
    func appendFile(_ path: String, data: String) -> Bool
    func unlink(_ path: String) -> Bool
    func mkdir(_ path: String, recursive: Bool) -> Bool
    func readdir(_ path: String) -> [FileInfo]?
    func stat(_ path: String) -> FileInfo?
    func saveFile(_ tempPath: String, destPath: String) -> String?
}

/// 设备提供者接口
public protocol DeviceProvider {
    func getSystemInfo() -> SystemInfo
    func vibrate(_ type: VibrateType)
    func getNetworkType() -> NetworkType
}

// ============================================================
// 数据模型
// ============================================================

/// JS 值类型
public enum JSValue {
    case Null
    case KUndefined
    case KBool(Bool)
    case KNumber(Double)
    case KString(String)
    case KArray([JSValue])
    case KObject([String: JSValue])

    public func toBool() -> Bool {
        if case .KBool(let value) = self { return value }
        return false
    }

    public func toDouble() -> Double {
        if case .KNumber(let value) = self { return value }
        return 0
    }

    public func toString() -> String {
        if case .KString(let value) = self { return value }
        return ""
    }
}

/// JS 数组
public struct JSArray {
    public let elements: [JSValue]

    public func getString(_ index: Int) -> String {
        guard index < elements.count else { return "" }
        return elements[index].toString()
    }

    public func getNumber(_ index: Int) -> Double {
        guard index < elements.count else { return 0 }
        return elements[index].toDouble()
    }

    public func getBool(_ index: Int) -> Bool {
        guard index < elements.count else { return false }
        return elements[index].toBool()
    }

    public var size: Int { elements.count }
}

/// DOM 事件
public struct DOMEvent: Codable {
    public let type: String
    public let target: String
    public let currentTarget: String
    public let detail: [String: AnyCodable]?
    public let timestamp: Int64
}

/// API 结果
public enum APIResult {
    case Success(data: Any)
    case Fail(errCode: Int, errMsg: String)
}

/// 网络请求
public struct NetworkRequest {
    public let url: String
    public var method: String = "GET"
    public var headers: [String: String] = [:]
    public var data: String?
    public var timeout: TimeInterval = 30

    public init(url: String) { self.url = url }
}

/// 网络响应
public struct NetworkResponse {
    public let statusCode: Int
    public let header: [String: String]
    public let data: String?
    public let cookies: [String]
}

/// 上传配置
public struct UploadConfig {
    public let url: String
    public let filePath: String
    public let name: String
    public var formData: [String: String] = [:]
}

/// 下载配置
public struct DownloadConfig {
    public let url: String
    public var filePath: String?
}

/// 下载结果
public enum DownloadResult {
    case progress(percent: Int, bytes: Int64)
    case success(filePath: String)
    case failed(error: String)
}

/// 存储信息
public struct StorageInfo {
    public let keys: [String]
    public let currentSize: Int64
    public let limitSize: Int64
}

/// 文件信息
public struct FileInfo {
    public let path: String
    public let size: Int64
    public let isDirectory: Bool
    public let lastModified: Date
}

/// 系统信息
public struct SystemInfo {
    public let brand: String
    public let model: String
    public let pixelRatio: Float
    public let screenWidth: Int
    public let screenHeight: Int
    public let windowWidth: Int
    public let windowHeight: Int
    public let statusBarHeight: Int
    public let language: String
    public let version: String
    public let platform: String
    public let SDKVersion: String
}

/// 振动类型
public enum VibrateType {
    case short, long, heavy, medium, light
}

/// 网络类型
public enum NetworkType {
    case wifi, cellular2G, cellular3G, cellular4G, cellular5G, none, unknown
}

/// AnyCodable 包装器
public struct AnyCodable: Codable {
    public let value: Any

    public init(_ value: Any) { self.value = value }

    public init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()
        if let string = try? container.decode(String.self) { value = string }
        else if let int = try? container.decode(Int.self) { value = int }
        else if let double = try? container.decode(Double.self) { value = double }
        else if let bool = try? container.decode(Bool.self) { value = bool }
        else { value = "" }
    }

    public func encode(to encoder: Encoder) throws {
        var container = encoder.singleValueContainer()
        if let string = value as? String { try container.encode(string) }
        else if let int = value as? Int { try container.encode(int) }
        else if let double = value as? Double { try container.encode(double) }
        else if let bool = value as? Bool { try container.encode(bool) }
        else { try container.encodeNil() }
    }
}
