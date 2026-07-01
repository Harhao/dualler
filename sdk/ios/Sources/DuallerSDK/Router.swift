import Foundation

/// Routes BridgeMessages to registered handlers
public final class Router {
    public func route(_ message: BridgeMessage, handlers: [String: Handler]) -> String? {
        guard let payload = message.payload,
              let apiName = payload["api"] as? String else {
            return nil
        }

        guard let handler = handlers[apiName] else {
            return String(format: "{\"error\":\"No handler for %@\"}", apiName)
        }

        return handler.handle(message)
    }
}
