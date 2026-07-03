import UIKit
import WebKit

public enum DuallerError: Error {
    case invalidConfig(String)
    case bundleLoadFailed(String)
    case javascriptError(String)
}

public struct EngineConfig {
    public let debugMode: Bool
    public let bundleURL: URL
    public let errorHandler: ((Error) -> Void)?
    public let maxCacheSize: Int

    public init(debugMode: Bool = false, bundleURL: URL, errorHandler: ((Error) -> Void)? = nil, maxCacheSize: Int = 5) {
        self.debugMode = debugMode
        self.bundleURL = bundleURL
        self.errorHandler = errorHandler
        self.maxCacheSize = maxCacheSize
    }
}

public final class DuallerEngine {
    private static var sharedInstance: DuallerWebView?
    private static var _pool: PageWebViewPool?

    public static func init(_ app: UIApplication, config: EngineConfig) throws -> DuallerEngineInstance {
        let webView = try DuallerWebView(bundleURL: config.bundleURL, debugMode: config.debugMode)
        sharedInstance = webView

        let bridgeManager = BridgeManager()
        let jsEngine = JSContextEngine(context: webView.context)

        // Create the page WebView pool.
        let pagePool = PageWebViewPool(context: app, config: config, maxCacheSize: config.maxCacheSize)
        _pool = pagePool

        return DuallerEngineInstance(webView: webView, bridgeManager: bridgeManager, jsEngine: jsEngine, pool: pagePool)
    }

    public static func getInstance() -> DuallerWebView? {
        sharedInstance
    }

    public static func getPool() -> PageWebViewPool? {
        _pool
    }

    public static func destroy() {
        _pool?.clear()
        _pool = nil
        sharedInstance = nil
    }
}

public struct DuallerEngineInstance {
    public let webView: DuallerWebView
    public let bridgeManager: BridgeManager
    public let jsEngine: JSContextEngine
    public let pool: PageWebViewPool
}
