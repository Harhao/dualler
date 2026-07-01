import UIKit

/// Handles page navigation
public final class NavigationHandler: Handler {
    public let apiName: String = "dualler.navigateTo"

    public func handle(_ message: BridgeMessage) -> String? {
        guard let payload = message.payload,
              let url = payload["url"] as? String else {
            return "{\"errMsg\":\"invalid navigation URL\"}"
        }
        // In production, would present a new ViewController
        print("[Dualler] Navigate to: \(url)")
        return "{}"
    }
}
