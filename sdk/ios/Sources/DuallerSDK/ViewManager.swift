import UIKit

/// Manages native UI views mapped from DSL nodes
public final class ViewManager {
    private var views: [String: UIView] = [:]

    public func createView(nodeType: String, props: [String: Any?]) -> UIView {
        switch nodeType {
        case "view":
            return UIView()
        case "text":
            let label = UILabel()
            if let fontSize = props["fontSize"] as? CGFloat {
                label.font = label.font.withSize(fontSize)
            }
            if let colorStr = props["color"] as? String {
                label.textColor = UIColor(hex: colorStr)
            }
            return label
        case "image":
            return UIImageView()
        default:
            return UIView()
        }
    }

    public func registerView(id: String, view: UIView) {
        views[id] = view
    }

    public func getView(id: String) -> UIView? {
        views[id]
    }

    public func removeView(id: String) {
        views.removeValue(forKey: id)
    }
}
