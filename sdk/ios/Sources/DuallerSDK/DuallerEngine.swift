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

    public init(debugMode: Bool = false, bundleURL: URL, errorHandler: ((Error) -> Void)? = nil) {
        self.debugMode = debugMode
        self.bundleURL = bundleURL
        self.errorHandler = errorHandler
    }
}

public final class DuallerEngine {
    private static var sharedInstance: DuallerWebView?

    public static func init(_ context: UIApplication, config: EngineConfig) throws -> DuallerEngineInstance {
        let webView = try DuallerWebView(bundleURL: config.bundleURL, debugMode: config.debugMode)
        sharedInstance = webView

        let bridgeManager = BridgeManager()
        let jsEngine = JSContextEngine(context: webView.context)

        return DuallerEngineInstance(webView: webView, bridgeManager: bridgeManager, jsEngine: jsEngine)
    }

    public static func getInstance() -> DuallerWebView? {
        sharedInstance
    }
}

public struct DuallerEngineInstance {
    public let webView: DuallerWebView
    public let bridgeManager: BridgeManager
    public let jsEngine: JSContextEngine
}
