import UIKit

/// Shows toast notifications to the user
public final class ToastHandler: Handler {
    public let apiName: String = "dualler.showToast"

    public func handle(_ message: BridgeMessage) -> String? {
        guard let payload = message.payload else { return "{}" }
        let title = payload["title"] as? String ?? ""
        let duration = (payload["duration"] as? TimeInterval) ?? 2.0

        DispatchQueue.main.async {
            let vc = UIApplication.shared.connectedScenes
                .compactMap { $0 as? UIWindowScene }
                .flatMap { $0.windows }
                .first { $0.isKeyWindow }

            let toast = UIAlertController(title: nil, message: title, preferredStyle: .alert)
            // Center-toast styling via positioning would go here in production
            vc?.present(toast, animated: true)
            DispatchQueue.main.asyncAfter(deadline: .now() + duration) {
                toast.dismiss(animated: false)
            }
        }

        return "{}"
    }
}
