import UIKit

/// WebView adaptation layer for global JS objects
public final class JSAdapter {
    private let context: JSContext

    public init(context: JSContext) {
        self.context = context
    }

    public func injectGlobalObjects() {
        let globals = """
            __DUALLER__ = {
                version: "0.1.0",
                platform: "ios",
                engine: "javascriptcore"
            };
        """
        self.context.evaluateScript(globals)
    }

    public func postMessageToNative(_ message: String) {
        // Called from JS side
    }
}
