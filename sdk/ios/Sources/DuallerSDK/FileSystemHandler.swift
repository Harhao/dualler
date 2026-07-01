import Foundation

/// Handles file system operations in the sandbox
public final class FileSystemHandler: Handler {
    public let apiName: String = "dualler.getFileSystemManager"

    private let fileManager = FileManager.default
    private let duallerDir: URL

    public init() {
        let container = fileManager.containerURL(
            forSecurityApplicationGroupIdentifier: "group.dualler"
        )
        self.duallerDir = container?.appendingPathComponent("dualler_files")
            ?? fileManager.temporaryDirectory.appendingPathComponent("dualler_files")
        try? self.fileManager.createDirectory(
            at: self.duallerDir,
            withIntermediateDirectories: true
        )
    }

    public func handle(_ message: BridgeMessage) -> String? {
        guard let payload = message.payload else { return "{}" }
        let path = payload["path"] as? String ?? ""
        let fullPath = self.duallerDir.appendingPathComponent(path).path

        switch payload["_op"] as? String {
        case "read":
            do {
                let content = try String(contentsOfFile: fullPath, encoding: .utf8)
                return "{\"content\":\"\(content)\"}"
            } catch {
                return "{\"errMsg\":\"read failed: \\(error.localizedDescription)\"}"
            }
        case "write":
            let data = payload["data"] as? String ?? ""
            do {
                try data.write(toFile: fullPath, atomically: true, encoding: .utf8)
                return "{\"success\":true}"
            } catch {
                return "{\"errMsg\":\"write failed: \\(error.localizedDescription)\"}"
            }
        case "stat":
            do {
                let attrs = try self.fileManager.attributesOfItem(atPath: fullPath)
                let isDir = attrs[.type] as? FileAttributeType == .typeDirectory
                let size = attrs[.size] as? Int ?? 0
                return String(format: "{\"isDir\":%d,\"size\":%d}", isDir ? 1 : 0, size)
            } catch {
                return "{\"errMsg\":\"stat failed: \\(error.localizedDescription)\"}"
            }
        default:
            return "{}"
        }
    }
}
