import UIKit

/// Returns device and screen information
public final class DeviceHandler: Handler {
    public let apiName: String = "dualler.getSystemInfo"

    public func handle(_ message: BridgeMessage) -> String? {
        let screen = UIScreen.main.bounds
        let device = UIDevice.current
        let statusBarHeight = UIApplication.shared.statusBarFrame.height

        return String(
            format: "{\"brand\":\"%@\",\"model\":\"%@\",\"system\":\"%s %@\",\"platform\":\"ios\",\"screenWidth\":%.0f,\"screenHeight\":%.0f,\"windowWidth\":%.0f,\"windowHeight\":%.0f,\"statusBarHeight\":%.0f,\"pixelRatio\":%.1f}",
            device.model as CFString,
            device.name,
            "iOS",
            device.systemVersion,
            screen.width,
            screen.height,
            screen.width,
            screen.height,
            Double(statusBarHeight),
            UIScreen.main.scale
        )
    }
}
