import Foundation
import WebKit

// ============================================================
// WKWebViewProvider - 基于 WKWebView 的渲染容器
// ============================================================

/// 基于 WKWebView 的 WebView 实现
///
/// 使用 iOS 原生的 WKWebView 渲染小程序 HTML
/// 支持 JS 执行、CSS 注入、消息通信
public class WKWebViewProvider: NSObject, WebViewProvider, WKScriptMessageHandler {
    private let context: ApplicationContext
    private var webView: WKWebView?
    private var messageHandler: ((String) -> Void)?
    private var ready = false

    public init(context: ApplicationContext) {
        self.context = context
        super.init()
        setupWebView()
    }

    // MARK: - WebViewProvider Protocol

    public func loadUrl(_ url: String) {
        guard let url = URL(string: url) else { return }
        let request = URLRequest(url: url)
        webView?.load(request)
    }

    public func loadHtml(_ html: String, baseUrl: String) {
        let wrappedHtml = wrapHtml(html)
        webView?.loadHTMLString(wrappedHtml, baseURL: URL(string: baseUrl))
    }

    public func evaluateJavascript(_ script: String, callback: ((String) -> Void)?) {
        webView?.evaluateJavaScript(script) { result, error in
            if let error = error {
                print("[Dualler] JS Error: \(error)")
                callback?("{}")
                return
            }

            if let result = result {
                callback?(String(describing: result))
            } else {
                callback?("null")
            }
        }
    }

    public func addJavascriptInterface(_ name: String, handler: @escaping (String) -> Void) {
        messageHandler = handler

        // 注入消息接口
        let script = """
        window.\(name) = {
            postMessage: function(message) {
                window.webkit.messageHandlers.\(name).postMessage(message);
            }
        };
        """

        let userScript = WKUserScript(source: script, injectionTime: .atDocumentStart, forMainFrameOnly: true)
        webView?.configuration.userContentController.addUserScript(userScript)
        webView?.configuration.userContentController.add(self, name: name)
    }

    public func injectCSS(_ css: String) {
        let script = """
        var style = document.createElement('style');
        style.textContent = '\(css.replacingOccurrences(of: "'", with: "\\'").replacingOccurrences(of: "\n", with: " "))';
        document.head.appendChild(style);
        """
        evaluateJavascript(script, callback: nil)
    }

    public func injectScript(_ script: String) {
        evaluateJavascript(script, callback: nil)
    }

    public func configure(_ config: WebViewConfig) {
        guard let webView = webView else { return }

        webView.configuration.preferences.javaScriptEnabled = config.javaScriptEnabled ?? true

        if let userAgent = config.userAgent {
            webView.customUserAgent = userAgent
        }
    }

    public func setVisible(_ visible: Bool) {
        DispatchQueue.main.async { [weak self] in
            self?.webView?.isHidden = !visible
        }
    }

    public func destroy() {
        webView?.stopLoading()
        webView?.configuration.userContentController.removeAllUserScripts()
        webView?.configuration.userContentController.removeScriptMessageHandler(forName: "dualler")
        webView?.navigationDelegate = nil
        webView?.uiDelegate = nil
        webView = nil
        messageHandler = nil
        ready = false
    }

    // MARK: - WKScriptMessageHandler

    public func userContentController(_ userContentController: WKUserContentController,
                                       didReceive message: WKScriptMessage) {
        if let body = message.body as? String {
            messageHandler?(body)
        }
    }

    // MARK: - Private Methods

    private func setupWebView() {
        let config = WKWebViewConfiguration()
        config.preferences.javaScriptEnabled = true
        config.allowsInlineMediaPlayback = true

        // 注入 Bridge 脚本
        let bridgeScript = """
        window.dualler = {
            postMessage: function(message) {
                window.webkit.messageHandlers.dualler.postMessage(message);
            }
        };

        // 渲染引擎
        window.__dualler_render__ = {
            patch: function(pageId, data) {
                var container = document.getElementById('app');
                if (!container) return;

                for (var key in data) {
                    var elements = container.querySelectorAll('[data-bind-' + key + ']');
                    elements.forEach(function(el) {
                        el.textContent = data[key];
                    });
                }
            }
        };
        """

        let userScript = WKUserScript(source: bridgeScript, injectionTime: .atDocumentStart, forMainFrameOnly: true)
        config.userContentController.addUserScript(userScript)
        config.userContentController.add(self, name: "dualler")

        let webView = WKWebView(frame: .zero, configuration: config)
        webView.navigationDelegate = self
        webView.uiDelegate = self

        // 添加到父视图
        context.viewController.view.addSubview(webView)
        webView.translatesAutoresizingMaskIntoConstraints = false
        NSLayoutConstraint.activate([
            webView.topAnchor.constraint(equalTo: context.viewController.view.topAnchor),
            webView.bottomAnchor.constraint(equalTo: context.viewController.view.bottomAnchor),
            webView.leadingAnchor.constraint(equalTo: context.viewController.view.leadingAnchor),
            webView.trailingAnchor.constraint(equalTo: context.viewController.view.trailingAnchor)
        ])

        self.webView = webView
    }

    private func wrapHtml(_ html: String) -> String {
        return """
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body {
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                    font-size: 14px;
                    line-height: 1.5;
                    color: #333;
                }
                view { display: block; }
                text { display: inline; }
                button {
                    display: inline-block;
                    padding: 8px 16px;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                    background: #fff;
                    cursor: pointer;
                }
                button:active { background: #f0f0f0; }
                input, textarea {
                    padding: 8px;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                    font-size: 14px;
                }
            </style>
        </head>
        <body>
            <div id="app">\(html)</div>
            <script>
                // 通知就绪
                if (window.dualler) {
                    window.dualler.postMessage(JSON.stringify({ type: 'ready' }));
                }
            </script>
        </body>
        </html>
        """
    }
}

// MARK: - WKNavigationDelegate

extension WKWebViewProvider: WKNavigationDelegate {
    public func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        ready = true
    }

    public func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
        print("[Dualler] Navigation failed: \(error)")
    }
}

// MARK: - WKUIDelegate

extension WKWebViewProvider: WKUIDelegate {
    public func webView(_ webView: WKWebView,
                         runJavaScriptAlertPanelWithMessage message: String,
                         initiatedByFrame frame: WKFrameInfo,
                         completionHandler: @escaping () -> Void) {
        let alert = UIAlertController(title: "提示", message: message, preferredStyle: .alert)
        alert.addAction(UIAlertAction(title: "确定", style: .default) { _ in
            completionHandler()
        })
        context.viewController.present(alert, animated: true)
    }

    public func webView(_ webView: WKWebView,
                         runJavaScriptConfirmPanelWithMessage message: String,
                         initiatedByFrame frame: WKFrameInfo,
                         completionHandler: @escaping (Bool) -> Void) {
        let alert = UIAlertController(title: "确认", message: message, preferredStyle: .alert)
        alert.addAction(UIAlertAction(title: "确定", style: .default) { _ in
            completionHandler(true)
        })
        alert.addAction(UIAlertAction(title: "取消", style: .cancel) { _ in
            completionHandler(false)
        })
        context.viewController.present(alert, animated: true)
    }
}
