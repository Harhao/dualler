import UIKit
import WebKit

/// LRU-based WebView pool for iOS page reuse.
public final class PageWebViewPool {
    private let context: UIApplication
    private let config: EngineConfig
    private var maxCacheSize: Int

    private var idleMap = [String: DuallerWebView]()
    private var accessOrder: [String] = []
    private var allWebViews = [String: DuallerWebView]()

    init(context: UIApplication, config: EngineConfig, maxCacheSize: Int = 5) {
        self.context = context
        self.config = config
        self.maxCacheSize = maxCacheSize
    }

    /// Acquire a WebView for the given route. Creates one if none idle.
    public func acquire(route: String) throws -> DuallerWebView {
        // Check idle pool first.
        if let idle = idleMap[route] {
            // Move to front of access order (most recently used).
            accessOrder.removeAll { $0 == route }
            accessOrder.append(route)
            print("[PageWebViewPool] Reusing idle WebView for \(route)")
            return idle
        }

        // Evict LRU if at capacity.
        while idleMap.count >= maxCacheSize && !accessOrder.isEmpty {
            destroyOldest()
        }

        print("[PageWebViewPool] Creating new WebView for \(route)")
        let webView = try DuallerWebView(bundleURL: resolvePageURL(route), debugMode: config.debugMode)
        allWebViews[route] = webView
        accessOrder.append(route)
        return webView
    }

    /// Release a WebView back to the pool (hide it, mark idle).
    public func release(_ webView: DuallerWebView, forRoute route: String) {
        webView.isHidden = true
        webView.webView?.stopLoading()
        webView.webView?.pauseTimers()

        idleMap[route] = webView
        print("[PageWebViewPool] Released WebView for \(route) to pool")
    }

    /// Destroy the oldest (least recently used) idle WebView.
    public func destroyOldest() {
        guard let oldestRoute = accessOrder.first else { return }
        accessOrder.removeFirst()
        idleMap.removeValue(forKey: oldestRoute)
        allWebViews.removeValue(forKey: oldestRoute)
        print("[PageWebViewPool] Destroyed oldest WebView for \(oldestRoute) (LRU)")
    }

    /// Clear all WebViews from the pool.
    public func clear() {
        idleMap.removeAll()
        allWebViews.removeAll()
        accessOrder.removeAll()
        print("[PageWebViewPool] Cleared all WebViews from pool")
    }

    public var idleCount: Int { return idleMap.count }

    /// Resolve a page route to its bundle URL.
    private func resolvePageURL(_ route: String) -> URL {
        let pageName = route.components(separatedBy: "/").last ?? route
        let basePath = config.bundleURL.deletingLastPathComponent().deletingLastPathComponent()
        return basePath.appendingPathComponent("\(route)/\(pageName).js")
    }
}
