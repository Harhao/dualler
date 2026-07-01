import JavaScriptCore

/// JavaScriptCore wrapper for executing and managing JS scripts
public final class JSContextEngine {
    private let context: JSContext
    private var exceptionHandler: ((String, String) -> Void)?

    public init(context: JSContext) {
        self.context = context

        self.context.exceptionHandler = { _, exception in
            if let exc = exception, let str = exc.description {
                print("[Dualler] JS Exception: \(str)")
            }
        }
    }

    public func evaluate(_ script: String) -> Any? {
        return self.context.evaluateScript(script)
    }

    public func evaluateAsync(_ script: String, completion: @escaping (Any?) -> Void) {
        DispatchQueue.main.async {
            completion(self.evaluate(script))
        }
    }

    public func setValue(_ value: Any?, forKey key: String) {
        self.context[key] = value
    }

    public func value(forKey key: String) -> Any? {
        return self.context[key]
    }

    public func destroy() {
        self.context.exceptionHandler = nil
    }
}
