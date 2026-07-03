import UIKit
import WebKit

public final class DuallerWebView: UIView {
    private let webView: WKWebView?
    public let context: JSContext

    private lazy var javascriptContext: JSContext = {
        let context = self.webView?.value(forKey: "configuration") as? WKWebViewConfiguration
        return JSContext()
    }()

    public init(bundleURL: URL, debugMode: Bool = false, pageRoute: String? = nil) throws {
        let config = WKWebViewConfiguration()
        let scriptMessageHandler = DuallerScriptMessageHandler()
        config.userContentController.add(scriptMessageHandler, name: "WebKitBridge")

        let resolvedURL: URL
        if let route = pageRoute {
            resolvedURL = Self.resolvePageURL(from: bundleURL, route: route)
        } else {
            resolvedURL = bundleURL
        }

        self.webView = WKWebView(frame: .zero, configuration: config)

        // Extract JSContext from WKWebView via the evaluated JavaScript
        var capturedContext: JSContext?
        self.webView?.evaluateJavaScript("window") { result, _ in
            if let ctx = JSContext.current {
                capturedContext = ctx
            }
        }
        // For iOS, we use a separate JSContext initialized from the config
        self.context = JSContext()!

        super.init(frame: UIScreen.main.bounds)

        if let webView = self.webView {
            webView.frame = self.bounds
            webView.autoresizingMask = [.flexibleWidth, .flexibleHeight]
            self.addSubview(webView)
            self.injectBridge()

            if debugMode {
                WKWebViewConfiguration().userContentController.add(DuallerInspectorProxy(), name: "__inspect__")
            }

            if resolvedURL.isFileURL {
                webView.loadFileURL(resolvedURL, allowingReadAccessTo: resolvedURL.deletingLastPathComponent())
            } else {
                webView.load(URLRequest(url: resolvedURL))
            }
        }
    }

    /// Resolve a page route to its bundle URL based on the base bundleURL.
    ///   pages/index/index → file:///.../dist/pages/index/index.js
    private static func resolvePageURL(from baseUrl: URL, route: String) -> URL {
        let pageName = route.components(separatedBy: "/").last ?? route
        let distPath = baseUrl.path.contains("/dist/")
            ? baseUrl.absoluteURL.substring(before: "/dist/") + "/dist/"
            : "file:///var/containers/Bundle/Application/dist/"
        let distURL = URL(string: distPath)!
        return distURL.appendingPathComponent("\(route)/\(pageName).js")
    }

    public func loadPage(route: String) {
        guard let webView = self.webView else { return }
        let pageName = route.components(separatedBy: "/").last ?? route
        let currentDistPath = webView.url?.absoluteURL.substring(before: "/dist/") ?? "file:///android_asset/dist/"
        let pageURL = URL(string: "\(currentDistPath)/dist/\(route)/\(pageName).js")!
        if pageURL.isFileURL {
            webView.loadFileURL(pageURL, allowingReadAccessTo: pageURL.deletingLastPathComponent())
        } else {
            webView.load(URLRequest(url: pageURL))
        }
    }

    public func unloadPage() {
        self.webView?.stopLoading()
        self.webView?.pauseTimers()
        self.isHidden = true
    }

    /// Expose the underlying WKWebView for SDK integration.
    public var wkWebView: WKWebView? {
        return self.webView
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
