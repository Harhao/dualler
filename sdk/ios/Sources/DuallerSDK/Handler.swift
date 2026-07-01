import Foundation

/// Base protocol for all bridge handlers
public protocol Handler: AnyObject {
    var apiName: String { get }
    func handle(_ message: BridgeMessage) -> String?
}
