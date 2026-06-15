import Foundation

// ============================================================
// IOSPlatformBridge - iOS 平台 Bridge 实现
// ============================================================

/// iOS 平台 Bridge
///
/// 协调逻辑层（JavaScriptCore）和渲染层（WKWebView）之间的通信
public class IOSPlatformBridge: PlatformBridge {
    private let context: ApplicationContext
    private var apiHandlers: [String: APIHandler] = [:]
    private var pendingCallbacks: [String: (APIResult) -> Void] = [:]
    private weak var jsEngine: JSCoreEngine?
    private weak var webView: WKWebViewProvider?

    public init(context: ApplicationContext) {
        self.context = context
        registerDefaultAPIs()
    }

    // MARK: - PlatformBridge Protocol

    public func setData(_ pageId: String, data: [String: Any]) {
        guard let json = try? JSONSerialization.data(withJSONObject: data),
              let jsonString = String(data: json, encoding: .utf8) else {
            return
        }

        // 发送到渲染层
        let script = "window.__dualler_render__ && window.__dualler_render__.patch('\(pageId)', \(jsonString))"
        webView?.evaluateJavascript(script, callback: nil)
    }

    public func dispatchEvent(_ pageId: String, event: DOMEvent) {
        guard let json = try? JSONEncoder().encode(event),
              let jsonString = String(data: json, encoding: .utf8) else {
            return
        }

        // 发送到逻辑层
        let script = "__dualler_event__('\(pageId)', \(jsonString))"
        jsEngine?.evaluateScript(script, sourceUrl: "bridge://event")
    }

    public func callNative(_ api: String, params: [String: Any], callbackId: String) {
        guard let handler = apiHandlers[api] else {
            if !callbackId.isEmpty {
                invokeCallback(callbackId, result: .Fail(errCode: -1, errMsg: "Unknown API: \(api)"))
            }
            return
        }

        // 存储回调
        if !callbackId.isEmpty {
            pendingCallbacks[callbackId] = { [weak self] result in
                self?.invokeCallback(callbackId, result: result)
            }
        }

        // 调用处理器
        handler.invoke(params: params) { [weak self] result in
            if !callbackId.isEmpty {
                self?.invokeCallback(callbackId, result: result)
                self?.pendingCallbacks.removeValue(forKey: callbackId)
            }
        }
    }

    public func invokeCallback(_ callbackId: String, result: APIResult) {
        let jsonString: String
        switch result {
        case .Success(let data):
            if let json = try? JSONSerialization.data(withJSONObject: ["data": data]),
               let str = String(data: json, encoding: .utf8) {
                jsonString = str
            } else {
                jsonString = "{}"
            }
        case .Fail(let errCode, let errMsg):
            jsonString = "{\"errCode\":\(errCode),\"errMsg\":\"\(errMsg)\"}"
        }

        // 发送回调到 JS 引擎
        let script = "__dualler_callback__('\(callbackId)', \(jsonString))"
        jsEngine?.evaluateScript(script, sourceUrl: "bridge://callback")
    }

    public func registerAPI(_ name: String, handler: APIHandler) {
        apiHandlers[name] = handler
    }

    // MARK: - Connection

    public func connectEngine(_ engine: JSCoreEngine) {
        self.jsEngine = engine
    }

    public func connectWebView(_ view: WKWebViewProvider) {
        self.webView = view
    }

    // MARK: - Default APIs

    private func registerDefaultAPIs() {
        registerAPI("request", handler: NetworkAPIHandler())
        registerAPI("getStorage", handler: StorageGetAPIHandler())
        registerAPI("setStorage", handler: StorageSetAPIHandler())
        registerAPI("removeStorage", handler: StorageRemoveAPIHandler())
        registerAPI("getSystemInfo", handler: DeviceInfoAPIHandler())
        registerAPI("showToast", handler: ToastAPIHandler(viewController: context.viewController))
        registerAPI("showModal", handler: ModalAPIHandler(viewController: context.viewController))
        registerAPI("vibrate", handler: VibrateAPIHandler())
        registerAPI("getNetworkType", handler: NetworkTypeAPIHandler())
    }
}

// MARK: - API Handlers

/// 网络请求 API
class NetworkAPIHandler: APIHandler {
    private let session = URLSession.shared

    func invoke(params: [String: Any], callback: @escaping (APIResult) -> Void) {
        guard let urlString = params["url"] as? String,
              let url = URL(string: urlString) else {
            callback(.Fail(errCode: -1, errMsg: "Invalid URL"))
            return
        }

        let method = (params["method"] as? String ?? "GET").uppercased()
        let headers = params["headers"] as? [String: String] ?? [:]
        let data = params["data"] as? String

        var request = URLRequest(url: url)
        request.httpMethod = method
        headers.forEach { request.setValue($1, forHTTPHeaderField: $0) }

        if let data = data, ["POST", "PUT", "PATCH"].contains(method) {
            request.httpBody = data.data(using: .utf8)
            request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        }

        session.dataTask(with: request) { data, response, error in
            if let error = error {
                callback(.Fail(errCode: -1, errMsg: error.localizedDescription))
                return
            }

            guard let httpResponse = response as? HTTPURLResponse,
                  let data = data else {
                callback(.Fail(errCode: -1, errMsg: "No response"))
                return
            }

            let body = String(data: data, encoding: .utf8) ?? ""
            let result: [String: Any] = [
                "statusCode": httpResponse.statusCode,
                "header": httpResponse.allHeaderFields,
                "data": body
            ]
            callback(.Success(data: result))
        }.resume()
    }
}

/// 存储获取 API
class StorageGetAPIHandler: APIHandler {
    func invoke(params: [String: Any], callback: @escaping (APIResult) -> Void) {
        guard let key = params["key"] as? String else {
            callback(.Fail(errCode: -1, errMsg: "Missing key"))
            return
        }

        let value = UserDefaults.standard.string(forKey: "dualler_\(key)") ?? ""
        callback(.Success(data: ["data": value]))
    }
}

/// 存储设置 API
class StorageSetAPIHandler: APIHandler {
    func invoke(params: [String: Any], callback: @escaping (APIResult) -> Void) {
        guard let key = params["key"] as? String else {
            callback(.Fail(errCode: -1, errMsg: "Missing key"))
            return
        }

        let value = params["data"]
        UserDefaults.standard.set(value, forKey: "dualler_\(key)")
        callback(.Success(data: ["errMsg": "setStorage:ok"]))
    }
}

/// 存储删除 API
class StorageRemoveAPIHandler: APIHandler {
    func invoke(params: [String: Any], callback: @escaping (APIResult) -> Void) {
        guard let key = params["key"] as? String else {
            callback(.Fail(errCode: -1, errMsg: "Missing key"))
            return
        }

        UserDefaults.standard.removeObject(forKey: "dualler_\(key)")
        callback(.Success(data: ["errMsg": "removeStorage:ok"]))
    }
}

/// 设备信息 API
class DeviceInfoAPIHandler: APIHandler {
    func invoke(params: [String: Any], callback: @escaping (APIResult) -> Void) {
        let device = UIDevice.current
        let screen = UIScreen.main

        let result: [String: Any] = [
            "brand": "Apple",
            "model": device.model,
            "pixelRatio": screen.scale,
            "screenWidth": Int(screen.bounds.width * screen.scale),
            "screenHeight": Int(screen.bounds.height * screen.scale),
            "windowWidth": Int(screen.bounds.width),
            "windowHeight": Int(screen.bounds.height),
            "statusBarHeight": 44, // 简化处理
            "language": Locale.current.languageCode ?? "en",
            "version": device.systemVersion,
            "platform": "ios",
            "SDKVersion": "1.0.0"
        ]
        callback(.Success(data: result))
    }
}

/// Toast API
class ToastAPIHandler: APIHandler {
    weak var viewController: UIViewController?

    init(viewController: UIViewController) {
        self.viewController = viewController
    }

    func invoke(params: [String: Any], callback: @escaping (APIResult) -> Void) {
        let title = params["title"] as? String ?? ""
        let duration = params["duration"] as? Int ?? 1500

        DispatchQueue.main.async { [weak self] in
            let alert = UIAlertController(title: nil, message: title, preferredStyle: .alert)
            self?.viewController?.present(alert, animated: true)

            DispatchQueue.main.asyncAfter(deadline: .now() + .milliseconds(duration)) {
                alert.dismiss(animated: true)
            }
        }

        callback(.Success(data: ["errMsg": "showToast:ok"]))
    }
}

/// Modal API
class ModalAPIHandler: APIHandler {
    weak var viewController: UIViewController?

    init(viewController: UIViewController) {
        self.viewController = viewController
    }

    func invoke(params: [String: Any], callback: @escaping (APIResult) -> Void) {
        let title = params["title"] as? String ?? ""
        let content = params["content"] as? String ?? ""
        let showCancel = params["showCancel"] as? Bool ?? true

        DispatchQueue.main.async { [weak self] in
            let alert = UIAlertController(title: title, message: content, preferredStyle: .alert)

            alert.addAction(UIAlertAction(title: params["confirmText"] as? String ?? "确定", style: .default) { _ in
                callback(.Success(data: ["confirm": true]))
            })

            if showCancel {
                alert.addAction(UIAlertAction(title: params["cancelText"] as? String ?? "取消", style: .cancel) { _ in
                    callback(.Success(data: ["confirm": false]))
                })
            }

            self?.viewController?.present(alert, animated: true)
        }
    }
}

/// 振动 API
class VibrateAPIHandler: APIHandler {
    func invoke(params: [String: Any], callback: @escaping (APIResult) -> Void) {
        // iOS 不支持直接振动，使用 AudioServicesPlaySystemSound
        AudioServicesPlaySystemSound(kSystemSoundID_Vibrate)
        callback(.Success(data: ["errMsg": "vibrate:ok"]))
    }
}

/// 网络类型 API
class NetworkTypeAPIHandler: APIHandler {
    func invoke(params: [String: Any], callback: @escaping (APIResult) -> Void) {
        // 简化实现
        callback(.Success(data: ["networkType": "wifi"]))
    }
}
