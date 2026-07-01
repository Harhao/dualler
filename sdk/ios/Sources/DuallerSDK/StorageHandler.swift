import Foundation

/// Handles local storage operations
public final class StorageHandler: Handler {
    public let apiName: String = "dualler.setStorageSync"

    private let defaults = UserDefaults.standard

    public func handle(_ message: BridgeMessage) -> String? {
        guard let payload = message.payload else { return "{}" }

        switch payload["_operation"] as? String {
        case "set":
            let key = payload["_key"] as? String ?? ""
            let data = payload["_data"] as? String ?? ""
            self.defaults.set(data, forKey: key)
            return "{}"
        case "get":
            let key = payload["_key"] as? String ?? ""
            let value = self.defaults.string(forKey: key)
            return "{\"data\":\"\(value ?? "null")\"}"
        case "remove":
            let key = payload["_key"] as? String ?? ""
            self.defaults.removeObject(forKey: key)
            return "{}"
        case "clear":
            let suiteNames = self.defaults.dictionaryRepresentation().keys
            for key in suiteNames {
                self.defaults.removeObject(forKey: key)
            }
            return "{}"
        default:
            return "{}"
        }
    }
}
