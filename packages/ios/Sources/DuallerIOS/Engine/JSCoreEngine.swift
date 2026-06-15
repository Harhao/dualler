import Foundation
import JavaScriptCore

// ============================================================
// JSCoreEngine - 基于 JavaScriptCore 的 JS 引擎
// ============================================================

/// 基于 JavaScriptCore 的 JS 引擎实现
///
/// 使用 iOS 原生的 JavaScriptCore 框架执行 JS 代码
/// 支持沙箱隔离、回调注册、脚本执行
public class JSCoreEngine: JSEngine {
    private let context: JSContext
    private let queue: DispatchQueue
    private var callbacks: [String: (JSArray) -> JSValue] = [:]

    public init() {
        self.context = JSContext()!
        self.queue = DispatchQueue(label: "com.dualler.jsengine", qos: .userInitiated)

        setupSandbox()
        setupRuntime()
    }

    // MARK: - JSEngine Protocol

    public func evaluateScript(_ script: String, sourceUrl: String) -> JSValue {
        return queue.sync {
            let result = context.evaluateScript(script, withSourceURL: URL(string: sourceUrl))
            return convertToJSValue(result)
        }
    }

    public func registerCallback(_ name: String, callback: @escaping (JSArray) -> JSValue) {
        callbacks[name] = callback

        let block: @convention(block) (JSValue) -> JSValue = { args in
            let jsArray = JSArray(elements: self.convertToArray(args))
            return callback(jsArray)
        }

        context.setObject(block, forKeyedSubscript: name as NSString)
    }

    public func registerObject(_ name: String, obj: [String: (JSArray) -> JSValue]) {
        let dict = NSMutableDictionary()

        for (key, fn) in obj {
            let block: @convention(block) (JSValue) -> JSValue = { args in
                let jsArray = JSArray(elements: self.convertToArray(args))
                return fn(jsArray)
            }
            dict[key] = block
        }

        context.setObject(dict, forKeyedSubscript: name as NSString)
    }

    public func destroy() {
        callbacks.removeAll()
    }

    // MARK: - Sandbox Setup

    private func setupSandbox() {
        // 剔除高危模块
        context.evaluateScript("""
            var std = undefined;
            var os = undefined;
            var ScriptInternals = undefined;
        """)

        // 锁定核心 Bridge 函数
        context.evaluateScript("""
            Object.defineProperty(this, '__dualler_setData', {
                writable: false, configurable: false, value: function() {}
            });
            Object.defineProperty(this, '__dualler_callNative', {
                writable: false, configurable: false, value: function() {}
            });
            Object.defineProperty(this, '__dualler_event__', {
                writable: false, configurable: false, value: function() {}
            });
            Object.defineProperty(this, '__dualler_callback__', {
                writable: false, configurable: false, value: function() {}
            });
        """)

        // 禁用 eval 和 Function
        context.evaluateScript("""
            this.eval = undefined;
            this.Function = undefined;
        """)
    }

    // MARK: - Runtime Setup

    private func setupRuntime() {
        // 注入 console
        let consoleLog: @convention(block) (String) -> Void = { message in
            NSLog("[Dualler] %@", message)
        }
        let consoleWarn: @convention(block) (String) -> Void = { message in
            NSLog("[Dualler WARN] %@", message)
        }
        let consoleError: @convention(block) (String) -> Void = { message in
            NSLog("[Dualler ERROR] %@", message)
        }

        let console = JSValue(newObjectIn: context)
        console?.setObject(consoleLog, forKeyedSubscript: "log" as NSString)
        console?.setObject(consoleWarn, forKeyedSubscript: "warn" as NSString)
        console?.setObject(consoleError, forKeyedSubscript: "error" as NSString)
        context.setObject(console, forKeyedSubscript: "console" as NSString)

        // 注入 Dualler 运行时
        context.evaluateScript(duallerRuntimeJS)
    }

    // MARK: - Value Conversion

    private func convertToJSValue(_ value: JSValue?) -> JSValue {
        guard let value = value, !value.isUndefined, !value.isNull else {
            return .Null
        }

        if value.isBoolean {
            return .KBoolean(value.toBool())
        }

        if value.isNumber {
            return .KNumber(value.toDouble())
        }

        if value.isString {
            return .KString(value.toString())
        }

        if value.isArray {
            let array = value.toArray() as? [Any] ?? []
            let elements = array.map { convertToJSValue(JSValue(object: $0, in: context)) }
            return .KArray(elements: elements)
        }

        if value.isObject {
            let dict = value.toDictionary() as? [String: Any] ?? [:]
            let properties = dict.mapValues { convertToJSValue(JSValue(object: $0, in: context)) }
            return .KObject(properties: properties)
        }

        return .Null
    }

    private func convertToArray(_ value: JSValue) -> [JSValue] {
        guard value.isArray else { return [] }
        let array = value.toArray() as? [Any] ?? []
        return array.map { convertToJSValue(JSValue(object: $0, in: context)) }
    }
}

// MARK: - Dualler Runtime JS

private let duallerRuntimeJS = """
var __dualler_pages__ = {};
var __dualler_app__ = {};
var __dualler_currentPage__ = null;
var __dualler_callbacks__ = {};
var __dualler_callback_id__ = 0;

function __dualler_ref(value) {
    return { value: value };
}

function __dualler_reactive(obj) {
    return new Proxy(obj, {
        set: function(target, key, value) {
            target[key] = value;
            if (__dualler_currentPage__) {
                __dualler_setData(__dualler_currentPage__, JSON.stringify({[key]: value}));
            }
            return true;
        }
    });
}

function __dualler_page__(pageId, options) {
    __dualler_pages__[pageId] = options;
    if (options.setup) {
        __dualler_pages__[pageId]._data = options.setup();
    }
}

function __dualler_event__(pageId, event) {
    var page = __dualler_pages__[pageId];
    if (page && page.methods && page.methods[event.type]) {
        page.methods[event.type].call(page._data, event);
    }
}

function __dualler_call(api, params, callback) {
    var id = 'cb_' + (++__dualler_callback_id__);
    if (callback) {
        __dualler_callbacks__[id] = callback;
    }
    __dualler_callNative(api, JSON.stringify(params), id);
}

function __dualler_callback__(callbackId, result) {
    var cb = __dualler_callbacks__[callbackId];
    if (cb) {
        cb(result);
        delete __dualler_callbacks__[callbackId];
    }
}

var wx = {
    request: function(opts) {
        __dualler_call('request', opts, opts.success);
    },
    navigateTo: function(opts) {
        __dualler_call('navigateTo', opts);
    },
    navigateBack: function(opts) {
        __dualler_call('navigateBack', opts || {});
    },
    showToast: function(opts) {
        __dualler_call('showToast', opts);
    },
    getSystemInfo: function(opts) {
        __dualler_call('getSystemInfo', {}, opts.success);
    },
    createWorker: function(scriptPath) {
        return {
            postMessage: function(data) {
                __dualler_call('worker.postMessage', {scriptPath: scriptPath, data: data}, null);
            },
            onMessage: function(handler) {
                __dualler_callbacks__['worker_' + scriptPath] = handler;
            },
            terminate: function() {
                __dualler_call('worker.terminate', {scriptPath: scriptPath}, null);
            }
        };
    }
};
"""
