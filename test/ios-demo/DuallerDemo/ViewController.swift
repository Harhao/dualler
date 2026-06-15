import UIKit
import WebKit

/**
 * iOS 演示首页
 *
 * 点击按钮启动 Dualler 小程序
 */
class ViewController: UIViewController {

    private let appId = "com.example.dualler-demo"

    override func viewDidLoad() {
        super.viewDidLoad()
        setupUI()
    }

    private func setupUI() {
        view.backgroundColor = UIColor(red: 0.96, green: 0.96, blue: 0.96, alpha: 1.0)

        // 标题
        let titleLabel = UILabel()
        titleLabel.text = "Dualler"
        titleLabel.font = UIFont.systemFont(ofSize: 36, weight: .bold)
        titleLabel.textColor = UIColor(red: 0.1, green: 0.45, blue: 0.91, alpha: 1.0)
        titleLabel.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(titleLabel)

        // 副标题
        let subtitleLabel = UILabel()
        subtitleLabel.text = "小程序引擎演示"
        subtitleLabel.font = UIFont.systemFont(ofSize: 16)
        subtitleLabel.textColor = .gray
        subtitleLabel.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(subtitleLabel)

        // 平台标签
        let platformLabel = UILabel()
        platformLabel.text = "iOS Demo"
        platformLabel.font = UIFont.systemFont(ofSize: 14)
        platformLabel.textColor = .lightGray
        platformLabel.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(platformLabel)

        // 启动按钮
        let launchButton = UIButton(type: .system)
        launchButton.setTitle("🚀 启动小程序", for: .normal)
        launchButton.titleLabel?.font = UIFont.systemFont(ofSize: 18, weight: .semibold)
        launchButton.backgroundColor = UIColor(red: 0.1, green: 0.45, blue: 0.91, alpha: 1.0)
        launchButton.setTitleColor(.white, for: .normal)
        launchButton.layer.cornerRadius = 12
        launchButton.translatesAutoresizingMaskIntoConstraints = false
        launchButton.addTarget(self, action: #selector(launchMiniProgram), for: .touchUpInside)
        view.addSubview(launchButton)

        // 说明文字
        let descLabel = UILabel()
        descLabel.text = "点击上方按钮启动 Dualler 示例小程序\n请先将编译产物放到 Documents/dualler/ 目录"
        descLabel.font = UIFont.systemFont(ofSize: 12)
        descLabel.textColor = .gray
        descLabel.textAlignment = .center
        descLabel.numberOfLines = 0
        descLabel.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(descLabel)

        // 布局
        NSLayoutConstraint.activate([
            titleLabel.centerXAnchor.constraint(equalTo: view.centerXAnchor),
            titleLabel.centerYAnchor.constraint(equalTo: view.centerYAnchor, constant: -120),

            subtitleLabel.centerXAnchor.constraint(equalTo: view.centerXAnchor),
            subtitleLabel.topAnchor.constraint(equalTo: titleLabel.bottomAnchor, constant: 8),

            platformLabel.centerXAnchor.constraint(equalTo: view.centerXAnchor),
            platformLabel.topAnchor.constraint(equalTo: subtitleLabel.bottomAnchor, constant: 4),

            launchButton.centerXAnchor.constraint(equalTo: view.centerXAnchor),
            launchButton.topAnchor.constraint(equalTo: platformLabel.bottomAnchor, constant: 48),
            launchButton.leadingAnchor.constraint(equalTo: view.leadingAnchor, constant: 32),
            launchButton.trailingAnchor.constraint(equalTo: view.trailingAnchor, constant: -32),
            launchButton.heightAnchor.constraint(equalToConstant: 56),

            descLabel.centerXAnchor.constraint(equalTo: view.centerXAnchor),
            descLabel.topAnchor.constraint(equalTo: launchButton.bottomAnchor, constant: 16),
            descLabel.leadingAnchor.constraint(equalTo: view.leadingAnchor, constant: 32),
            descLabel.trailingAnchor.constraint(equalTo: view.trailingAnchor, constant: -32),
        ])
    }

    @objc private func launchMiniProgram() {
        // 获取小程序包路径
        let documentsPath = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0]
        let packagePath = documentsPath.appendingPathComponent("dualler/packages/\(appId)")

        guard FileManager.default.fileExists(atPath: packagePath.path) else {
            showAlert(title: "提示", message: "小程序包不存在，请先编译 example 并复制到 Documents/dualler/packages/ 目录")
            return
        }

        // 启动小程序
        let duallerVC = DuallerViewController(appId: appId, packagePath: packagePath)
        present(duallerVC, animated: true)
    }

    private func showAlert(title: String, message: String) {
        let alert = UIAlertController(title: title, message: message, preferredStyle: .alert)
        alert.addAction(UIAlertAction(title: "确定", style: .default))
        present(alert, animated: true)
    }
}
