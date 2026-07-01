import Foundation

/// Encodes and decodes BridgeMessage objects
public final class Parser {
    private let decoder = JSONDecoder()
    private let encoder = JSONEncoder()

    public func decode(_ jsonString: String) -> BridgeMessage? {
        guard let data = jsonString.data(using: .utf8) else { return nil }
        return try? self.decoder.decode(BridgeMessage.self, from: data)
    }

    public func encode(_ message: BridgeMessage) -> String? {
        guard let data = try? self.encoder.encode(message),
              let string = String(data: data, encoding: .utf8) else { return nil }
        return string
    }
}
