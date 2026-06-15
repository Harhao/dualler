import UIKit
import WebKit

/**
 * Dualler 小程序 ViewController
 *
 * 使用 WKWebView 加载并运行小程序
 */
class DuallerViewController: UIViewController, WKScriptMessageHandler {

    private let appId: String
    private let packagePath: URL
    private var webView: WKWebView!

    init(appId: String, packagePath: URL) {
        self.appId = appId
        self.packagePath = packagePath
        super.init(nibName: nil, bundle: nil)
        self.modalPresentationStyle = .fullScreen
    }

    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }

    override func viewDidLoad() {
        super.viewDidLoad()
        setupWebView()
        loadMiniProgram()
    }

    private func setupWebView() {
        // 配置 WKWebView
        let config = WKWebViewConfiguration()
        config.preferences.javaScriptEnabled = true

        // 注入 Bridge
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

        // 创建 WebView
        webView = WKWebView(frame: .zero, configuration: config)
        webView.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(webView)

        // 布局
        NSLayoutConstraint.activate([
            webView.topAnchor.constraint(equalTo: view.topAnchor),
            webView.bottomAnchor.constraint(equalTo: view.bottomAnchor),
            webView.leadingAnchor.constraint(equalTo: view.leadingAnchor),
            webView.trailingAnchor.constraint(equalTo: view.trailingAnchor)
        ])
    }

    private func loadMiniProgram() {
        let indexPath = packagePath.appendingPathComponent("pages/index/index.html")

        guard FileManager.default.fileExists(atPath: indexPath.path) else {
            showAlert(title: "错误", message: "首页文件不存在")
            return
        }

        do {
            let html = try String(contentsOf: indexPath, encoding: .utf8)
            let cssPath = packagePath.appendingPathComponent("pages/index/index.css")
            let jsPath = packagePath.appendingPathComponent("pages/index/index.js")

            let css = (try? String(contentsOf: cssPath, encoding: .utf8)) ?? ""
            let js = (try? String(contentsOf: jsPath, encoding: .utf8)) ?? ""

            let fullHtml = buildHtml(body: html, css: css, js: js)
            webView.loadHTMLString(fullHtml, baseURL: URL(string: "https://dualler.local"))
        } catch {
            showAlert(title: "错误", message: "加载失败: \(error.localizedDescription)")
        }
    }

    private func buildHtml(body: String, css: String, js: String) -> String {
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
                var wx = {
                    showToast: function(opts) { dualler.postMessage(JSON.stringify({type:'api',api:'showToast',params:opts})); },
                    showModal: function(opts) { dualler.postMessage(JSON.stringify({type:'api',api:'showModal',params:opts})); },
                    navigateTo: function(opts) { dualler.postMessage(JSON.stringify({type:'api',api:'navigateTo',params:opts})); },
                    navigateBack: function() { dualler.postMessage(JSON.stringify({type:'api',api:'navigateBack'})); },
                    getSystemInfo: function(opts) { dualler.postMessage(JSON.stringify({type:'api',api:'getSystemInfo',params:opts})); }
                };
                \(js)
                dualler.postMessage(JSON.stringify({type:'ready'}));
            </script>
        </body>
        </html>
        """
    }

    // MARK: - WKScriptMessageHandler

    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        guard let body = message.body as? String else { return }

        do {
            if let json = try JSONSerialization.jsonObject(with: body.data(using: .utf8)!) as? [String: Any],
               let type = json["type"] as? String,
               type == "api",
               let api = json["api"] as? String {
                let params = json["params"] as? [String: Any]
                handleApiCall(api: api, params: params)
            }
        } catch {
            print("Error parsing message: \(error)")
        }
    }

    private func handleApiCall(api: String, params: [String: Any]?) {
        switch api {
        case "showToast":
            let title = params?["title"] as? String ?? ""
            showToast(message: title)
        case "showModal":
            let title = params?["title"] as? String ?? "提示"
            let content = params?["content"] as? String ?? ""
            showAlert(title: title, message: content)
        case "navigateBack":
            dismiss(animated: true)
        default:
            break
        }
    }

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
