import UIKit
import WebKit

/**
 * Dualler SDK Entry Point
 *
 * High-level API for launching mini-programs in iOS apps.
 * Similar to Android's DuallerSDK.
 */
public class DuallerSDK {

    public static let shared = DuallerSDK()

    private init() {}

    /**
     * Launch a mini-program
     *
     * - Parameters:
     *   - appId: Mini-program application ID
     *   - from: The view controller to present from
     *   - completion: Called when the mini-program is dismissed
     */
    public func launchApp(
        appId: String,
        from viewController: UIViewController,
        completion: (() -> Void)? = nil
    ) {
        // Find the package directory
        let documentsPath = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0]
        let packagePath = documentsPath.appendingPathComponent("dualler/packages/\(appId)")

        guard FileManager.default.fileExists(atPath: packagePath.path) else {
            showAlert(
                from: viewController,
                title: "错误",
                message: "小程序包不存在: \(packagePath.path)"
            )
            return
        }

        // Create and present the mini-program view controller
        let miniProgramVC = DuallerMiniProgramViewController(
            appId: appId,
            packagePath: packagePath
        )
        miniProgramVC.onDismiss = completion
        miniProgramVC.modalPresentationStyle = .fullScreen
        viewController.present(miniProgramVC, animated: true)
    }

    private func showAlert(from viewController: UIViewController, title: String, message: String) {
        let alert = UIAlertController(title: title, message: message, preferredStyle: .alert)
        alert.addAction(UIAlertAction(title: "确定", style: .default))
        viewController.present(alert, animated: true)
    }
}

/**
 * Mini-program View Controller
 *
 * Loads and runs a mini-program using WKWebView.
 * Handles wx API calls and page navigation.
 */
public class DuallerMiniProgramViewController: UIViewController, WKScriptMessageHandler {

    private let appId: String
    private let packagePath: URL
    private var webView: WKWebView!
    private var currentPagePath: String = "pages/index/index"

    public var onDismiss: (() -> Void)?

    public init(appId: String, packagePath: URL) {
        self.appId = appId
        self.packagePath = packagePath
        super.init(nibName: nil, bundle: nil)
    }

    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }

    public override func viewDidLoad() {
        super.viewDidLoad()
        setupWebView()
        loadPage(path: "pages/index/index")
    }

    // MARK: - WebView Setup

    private func setupWebView() {
        let config = WKWebViewConfiguration()
        config.preferences.javaScriptEnabled = true

        // Inject bridge script
        let bridgeScript = """
        window.dualler = {
            postMessage: function(message) {
                window.webkit.messageHandlers.dualler.postMessage(message);
            }
        };
        """
        let userScript = WKUserScript(source: bridgeScript, injectionTime: .atDocumentStart, forMainFrameOnly: true)
        config.userContentController.addUserScript(userScript)
        config.userContentController.add(self, name: "dualler")

        // Create WebView
        webView = WKWebView(frame: .zero, configuration: config)
        webView.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(webView)

        // Layout
        NSLayoutConstraint.activate([
            webView.topAnchor.constraint(equalTo: view.topAnchor),
            webView.bottomAnchor.constraint(equalTo: view.bottomAnchor),
            webView.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            webView.trailingAnchor.constraint(equalTo: view.trailingAnchor)
        ])
    }

    // MARK: - Page Loading

    private func loadPage(path: String) {
        currentPagePath = path

        let htmlPath = packagePath.appendingPathComponent("\(path).html")
        let cssPath = packagePath.appendingPathComponent("\(path).css")
        let jsPath = packagePath.appendingPathComponent("\(path).js")

        guard FileManager.default.fileExists(atPath: htmlPath.path) else {
            showAlert(title: "错误", message: "页面不存在: \(path)")
            return
        }

        do {
            let html = try String(contentsOf: htmlPath, encoding: .utf8)
            let css = (try? String(contentsOf: cssPath, encoding: .utf8)) ?? ""
            let js = (try? String(contentsOf: jsPath, encoding: .utf8)) ?? ""

            let fullHtml = buildPageHtml(body: html, css: css, js: js, pagePath: path)
            webView.loadHTMLString(fullHtml, baseURL: URL(string: "https://dualler.local"))
        } catch {
            showAlert(title: "错误", message: "加载失败: \(error.localizedDescription)")
        }
    }

    private func buildPageHtml(body: String, css: String, js: String, pagePath: String) -> String {
        return """
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { font-family: -apple-system, sans-serif; font-size: 14px; color: #333; background: #f5f5f5; }
                view { display: block; }
                text { display: inline; }
                button { padding: 8px 16px; border: 1px solid #ddd; border-radius: 4px; background: #fff; cursor: pointer; }
                input, textarea { padding: 8px; border: 1px solid #ddd; border-radius: 4px; }
                \(css)
            </style>
        </head>
        <body>
            <div id="app">\(body)</div>
            <script>
                // wx API implementation
                var wx = {
                    showToast: function(opts) {
                        dualler.postMessage(JSON.stringify({type:'api', api:'showToast', params:opts}));
                    },
                    showModal: function(opts) {
                        dualler.postMessage(JSON.stringify({type:'api', api:'showModal', params:opts}));
                    },
                    navigateTo: function(opts) {
                        dualler.postMessage(JSON.stringify({type:'api', api:'navigateTo', params:opts}));
                    },
                    redirectTo: function(opts) {
                        dualler.postMessage(JSON.stringify({type:'api', api:'redirectTo', params:opts}));
                    },
                    navigateBack: function(opts) {
                        dualler.postMessage(JSON.stringify({type:'api', api:'navigateBack', params:opts}));
                    },
                    reLaunch: function(opts) {
                        dualler.postMessage(JSON.stringify({type:'api', api:'reLaunch', params:opts}));
                    },
                    getSystemInfo: function(opts) {
                        var info = {
                            brand: 'Apple',
                            model: navigator.platform,
                            screenWidth: screen.width,
                            screenHeight: screen.height,
                            language: navigator.language,
                            platform: 'ios',
                            SDKVersion: '1.0.0'
                        };
                        if (opts.success) opts.success(info);
                    }
                };

                // Page lifecycle
                var __dualler_page_onLoad = function(query) {
                    console.log('Page loaded:', query);
                };

                // User script
                \(js)

                // Notify ready
                dualler.postMessage(JSON.stringify({type:'ready', page:'\(pagePath)'}));
            </script>
        </body>
        </html>
        """
    }

    // MARK: - WKScriptMessageHandler

    public func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        guard let body = message.body as? String else { return }

        do {
            if let json = try JSONSerialization.jsonObject(with: body.data(using: .utf8)!) as? [String: Any],
               let type = json["type"] as? String {
                switch type {
                case "api":
                    let api = json["api"] as? String ?? ""
                    let params = json["params"] as? [String: Any]
                    handleApiCall(api: api, params: params)
                case "ready":
                    print("[Dualler] Page ready: \(json["page"] as? String ?? "")")
                default:
                    break
                }
            }
        } catch {
            print("[Dualler] Error parsing message: \(error)")
        }
    }

    // MARK: - API Handling

    private func handleApiCall(api: String, params: [String: Any]?) {
        switch api {
        case "showToast":
            let title = params?["title"] as? String ?? ""
            showToast(message: title)

        case "showModal":
            let title = params?["title"] as? String ?? "提示"
            let content = params?["content"] as? String ?? ""
            showAlert(title: title, message: content)

        case "navigateTo":
            handleNavigateTo(params: params)

        case "redirectTo":
            handleNavigateTo(params: params)

        case "navigateBack":
            handleNavigateBack(params: params)

        case "reLaunch":
            if let url = params?["url"] as? String {
                let path = url.components(separatedBy: "?").first ?? url
                loadPage(path: path.hasPrefix("/") ? String(path.dropFirst()) : path)
            }

        default:
            print("[Dualler] Unknown API: \(api)")
        }
    }

    private func handleNavigateTo(params: [String: Any]?) {
        guard let url = params?["url"] as? String else { return }

        // Parse URL: /pages/path?key=value
        let components = url.components(separatedBy: "?")
        let path = components.first ?? url
        let normalizedPath = path.hasPrefix("/") ? String(path.dropFirst()) : path

        loadPage(path: normalizedPath)
    }

    private func handleNavigateBack(params: [String: Any]?) {
        // In simplified mode, just dismiss
        dismiss(animated: true) { [weak self] in
            self?.onDismiss?()
        }
    }

    // MARK: - UI Helpers

    private func showToast(message: String) {
        let alert = UIAlertController(title: nil, message: message, preferredStyle: .alert)
        present(alert, animated: true)
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) {
            alert.dismiss(animated: true)
        }
    }

    private func showAlert(title: String, message: String) {
        let alert = UIAlertController(title: title, message: message, preferredStyle: .alert)
        alert.addAction(UIAlertAction(title: "确定", style: .default))
        present(alert, animated: true)
    }
}
