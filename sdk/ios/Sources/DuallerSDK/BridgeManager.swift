import Foundation

/// Manages message parsing, routing, and handler dispatch
public final class BridgeManager {
    public let parser: Parser
    private let router: Router
    private var handlers: [String: Handler] = [:]

    public init() {
        self.parser = Parser()
        self.router = Router()
    }

    public func register(_ handler: Handler) {
        self.handlers[handler.apiName] = handler
    }

    public func handleMessage(_ rawMessage: String) -> String? {
        guard let message = self.parser.decode(rawMessage) else { return nil }
        return self.router.route(message, handlers: self.handlers)
    }

    public func sendMessage(_ message: BridgeMessage) {
        let encoder = JSONEncoder()
        if let data = try? encoder.encode(message),
           let json = String(data: data, encoding: .utf8) {
            print("[Bridge] Sending: \(json)")
        }
    }
}
