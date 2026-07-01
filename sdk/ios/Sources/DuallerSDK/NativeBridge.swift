import UIKit
import JavaScriptCore

/// Bridges JSContext and Native handlers
public final class NativeBridge {
    private let jsEngine: JSContextEngine
    private let bridgeManager: BridgeManager

    public init(jsEngine: JSContextEngine, bridgeManager: BridgeManager) {
        self.jsEngine = jsEngine
        self.bridgeManager = bridgeManager
    }

    public func callJS(_ code: String) {
        self.jsEngine.evaluate(code)
    }

    public func callNative(apiName: String, args: [String: Any], callbackId: String?) {
        let message = BridgeMessage(
            type: .api_call,
            payload: ["api": apiName, "args": args, "callbackId": callbackId]
        )
        let raw = self.bridgeManager.parser.encode(message) ?? "{}"
        _ = self.bridgeManager.handleMessage(raw)
    }
}
