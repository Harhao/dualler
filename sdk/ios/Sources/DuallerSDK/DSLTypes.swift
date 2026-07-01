import UIKit

/// Minimal types needed by ViewManager and WebViewRenderer

public struct DSLNode {
    public let type: NodeType
    public let tag: String
    public let props: [String: Any?]
    public let children: [DSLNode]
    public let key: Any?

    public init(
        type: NodeType,
        tag: String,
        props: [String: Any?] = [:],
        children: [DSLNode] = [],
        key: Any? = nil
    ) {
        self.type = type
        self.tag = tag
        self.props = props
        self.children = children
        self.key = key
    }
}

public enum NodeType {
    case element, text, fragment, comment
}

public struct PatchInstruction {
    public let op: String
    public let path: String
    public let value: Any?
}
