import UIKit

/// Handles media selection (chooseImage, chooseVideo)
public final class MediaHandler: Handler {
    public let apiName: String = "dualler.chooseImage"

    public func handle(_ message: BridgeMessage) -> String? {
        // In production, would present PHAsset picker
        return "{\"tempFilePaths\":[],\"tempFiles\":[]}"
    }
}
