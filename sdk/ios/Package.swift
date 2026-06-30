// swift-tools-version: 5.9

import PackageDescription

let package = Package(
    name: "DuallerSDK",
    platforms: [.iOS(.v13)],
    products: [
        .library(name: "DuallerSDK", targets: ["DuallerSDK"]),
    ],
    dependencies: [],
    targets: [
        .target(
            name: "DuallerSDK",
            path: "Sources/DuallerSDK"
        ),
    ]
)
