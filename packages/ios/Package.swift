// swift-tools-version:5.9
import PackageDescription

let package = Package(
    name: "DuallerIOS",
    platforms: [
        .iOS(.v15)
    ],
    products: [
        .library(
            name: "DuallerIOS",
            targets: ["DuallerIOS"]
        )
    ],
    targets: [
        .target(
            name: "DuallerIOS",
            path: "Sources/DuallerIOS"
        )
    ]
)
