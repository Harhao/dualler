import UIKit

/// Handles canvas operations (delegated to WebView)
public final class CanvasHandler: Handler {
    public let apiName: String = "canvas"

    public func handle(_ message: BridgeMessage) -> String? {
        // Canvas operations are delegated to the WebView
        return "{}"
    }
}
