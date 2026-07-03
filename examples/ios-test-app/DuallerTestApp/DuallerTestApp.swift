import UIKit
import DuallerSDK

@main
class AppDelegate: UIResponder, UIApplicationDelegate {
    var window: UIWindow?

    func application(
        _ application: UIApplication,
        didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?
    ) -> Bool {
        // Load from dist/pages/index/index.js (new naming convention)
        let bundlePath = Bundle.main.path(
            forResource: "index",
            ofType: "js",
            inDirectory: "dist/pages/index"
        )
        let bundleURL = bundlePath.map { URL(fileURLWithPath: $0) }

        // Initialize Dualler engine
        let config = EngineConfig(
            debugMode: true,
            bundleURL: bundleURL ?? URL(fileURLWithPath: "/dev/null"),
            maxCacheSize: 5
        )
        let engine = try! DuallerEngine.init(application, config: config)

        // Setup root view controller
        window = UIWindow(frame: UIScreen.main.bounds)
        let viewController = ViewController(engine: engine)
        window?.rootViewController = viewController
        window?.makeKeyAndVisible()

        return true
    }
}
