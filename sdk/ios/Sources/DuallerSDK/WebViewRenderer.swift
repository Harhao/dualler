import UIKit

/// Renders DSL nodes into native UIView hierarchies
public final class WebViewRenderer {
    private let viewManager = ViewManager()

    public func render(node: DSLNode) -> UIView {
        return renderNode(node)
    }

    private func renderNode(_ node: DSLNode) -> UIView {
        switch node.type {
        case .element:
            return self.viewManager.createView(nodeType: node.tag, props: node.props)
        case .text:
            let label = UILabel()
            label.text = node.tag
            if let fontSize = node.props["fontSize"] as? CGFloat {
                label.font = label.font.withSize(fontSize)
            }
            return label
        case .fragment, .comment:
            return UIView()
        }
    }

    public func patch(_ view: UIView?, instruction: PatchInstruction) {
        // Apply a single patch instruction
    }
}
