import Foundation
import JavaScriptCore
import WebKit

// ============================================================
// IOSPlatform - 完整的 iOS 基座实现
// ============================================================

/// iOS 平台实现
///
/// 让小程序引擎运行在 iOS 设备上
/// - JS 引擎：JavaScriptCore
/// - 渲染层：WKWebView
/// - 通信：WKScriptMessageHandler
/// - 存储：UserDefaults
/// - 网络：URLSession
public class IOSPlatform: Platform {
    public let name = "ios"

    private let context: ApplicationContext
    private lazy var networkProvider: NetworkProvider = URLSessionNetworkProvider()
    private lazy var storageProvider: StorageProvider = UserDefaultsStorageProvider()
    private lazy var fileProvider: FileProvider = SandboxFileProvider(context: context)
    private lazy var deviceProvider: DeviceProvider = UIDeviceProvider()

    public init(context: ApplicationContext) {
        self.context = context
    }

    public func createJSEngine() -> JSEngine {
        return JSCoreEngine()
    }

    public func createWebView() -> WebViewProvider {
        return WKWebViewProvider(context: context)
    }

    public func createBridge() -> PlatformBridge {
        return IOSPlatformBridge(context: context)
    }

    public var network: NetworkProvider { networkProvider }
    public var storage: StorageProvider { storageProvider }
    public var file: FileProvider { fileProvider }
    public var device: DeviceProvider { deviceProvider }
}

/// 应用上下文
public class ApplicationContext {
    public let viewController: UIViewController
    public let configuration: DuallerConfiguration

    public init(viewController: UIViewController, configuration: DuallerConfiguration = .default) {
        self.viewController = viewController
        self.configuration = configuration
    }
}

/// Dualler 配置
public struct DuallerConfiguration {
    public let debug: Bool
    public let maxPages: Int
    public let jsHeapSizeMB: Int
    public let maxCacheSizeMB: Int
    public let keepVersions: Int

    public static let `default` = DuallerConfiguration(
        debug: false,
        maxPages: 10,
        jsHeapSizeMB: 64,
        maxCacheSizeMB: 200,
        keepVersions: 2
    )

    public init(debug: Bool = false, maxPages: Int = 10, jsHeapSizeMB: Int = 64,
                maxCacheSizeMB: Int = 200, keepVersions: Int = 2) {
        self.debug = debug
        self.maxPages = maxPages
        self.jsHeapSizeMB = jsHeapSizeMB
        self.maxCacheSizeMB = maxCacheSizeMB
        self.keepVersions = keepVersions
    }
}
