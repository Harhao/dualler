import UIKit
import WebKit

public final class DuallerWebView: UIView {
    private let webView: WKWebView
    public let context: JSContext

    private lazy var javascriptContext: JSContext = {
        let context = self.webView.value(forKey: "configuration") as? WKWebViewConfiguration
        return JSContext()
    }()

    public init(bundleURL: URL, debugMode: Bool = false) throws {
        let config = WKWebViewConfiguration()
        let scriptMessageHandler = DuallerScriptMessageHandler()
        config.userContentController.add(scriptMessageHandler, name: "WebKitBridge")

        self.webView = WKWebView(frame: .zero, configuration: config)

        // Extract JSContext from WKWebView via the evaluated JavaScript
        var capturedContext: JSContext?
        self.webView.evaluateJavaScript("window") { result, _ in
            if let ctx = JSContext.current {
                capturedContext = ctx
            }
        }
        // For iOS, we use a separate JSContext initialized from the config
        self.context = JSContext()!

        super.init(frame: UIScreen.main.bounds)

        self.webView.frame = self.bounds
        self.webView.autoresizingMask = [.flexibleWidth, .flexibleHeight]
        self.addSubview(self.webView)

        self.injectBridge()

        if debugMode {
            WKWebViewConfiguration().userContentController.add(DuallerInspectorProxy(), name: "__inspect__")
        }

        if bundleURL.isFileURL {
            self.webView.loadFileURL(bundleURL, allowingReadAccessTo: bundleURL.deletingLastPathComponent())
        } else {
            self.webView.load(URLRequest(url: bundleURL))
        }
    }

    required public init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }

    private func injectBridge() {
        let bridgeScript = """
            (function() {
                window.__DUALLER_BRIDGE__ = {
                    postMessage: function(msg) {
                        window.webkit.messageHandlers.WebKitBridge.postMessage(msg);
                    }
                };
            })();
        """
        self.context.evaluateScript(bridgeScript)
    }

    public func evaluate(_ script: String, completion: ((Any?, Error?) -> Void)? = nil) {
        self.webView.evaluateJavaScript(script) { result, error in
            completion?(result, error)
        }
    }
}

// MARK: - Script message handler
private class DuallerScriptMessageHandler: NSObject, WKScriptMessageHandler {
    public func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        print("[Dualler] Bridge message: \(message.body)")
    }
}

private class DuallerInspectorProxy: NSObject, WKScriptMessageHandler {
    public func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        // Debug inspector placeholder
        print("[Dualler] Inspector: \(message.body)")
    }
}

// MARK: - Native bridge for JS <-> Swift communication
@objc protocol DuallerWebBridge {
    @objc func postMessage(_ message: String)
}

extension DuallerWebView: DuallerWebBridge {
    @objc func postMessage(_ message: String) {
        // Handle incoming messages from JavaScript
        print("[Dualler] Bridge message: \(message)")
    }
}
