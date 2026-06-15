# Dualler 测试项目

本目录包含 Dualler 的演示测试项目，用于在不同平台上预览小程序效果。

## 目录结构

```
test/
├── README.md              # 本文件
├── android-demo/          # Android 演示项目
├── ios-demo/              # iOS 演示项目
└── web-preview/           # Web 预览页面
```

---

## 🌐 Web 预览（最简单）

直接在浏览器中打开即可预览小程序效果：

```bash
# 打开预览页面
open test/web-preview/index.html
```

功能：
- 模拟小程序运行环境
- 计数器、待办事项、API 示例
- DevTools 控制台日志

---

## 🤖 Android 演示

### 前置条件

- Android Studio 2023+
- Android 模拟器或真机

### 运行步骤

```bash
# 1. 编译小程序示例
cd packages/compiler
npm install && npm run build
node dist/cli.js build \
  --appId com.example.dualler-demo \
  --entry ../example/src/app.vue \
  --pages ../example/src/pages/index/index.vue,../example/src/pages/detail/detail.vue,../example/src/pages/profile/profile.vue \
  --outputDir ../example/dist

# 2. 用 Android Studio 打开
open -a "Android Studio" test/android-demo

# 3. 运行项目（点击 Run 按钮）

# 4. 在模拟器中点击"启动小程序"按钮
```

### 或使用 ADB

```bash
# 安装 APK
adb install test/android-demo/app/build/outputs/apk/debug/app-debug.apk

# 推送小程序包
adb push packages/example/dist/ /sdcard/dualler/packages/com.example.dualler-demo/

# 启动应用
adb shell am start -n com.dualler.demo/.MainActivity
```

---

## 🍎 iOS 演示

### 前置条件

- Xcode 15+
- iOS 模拟器或真机

### 运行步骤

```bash
# 1. 编译小程序示例（同上）

# 2. 用 Xcode 打开
open test/ios-demo/DuallerDemo.xcodeproj

# 3. 运行项目（点击 Run 按钮）

# 4. 复制小程序包到模拟器
# 在模拟器中：Files → Browse → On My iPhone → DuallerDemo
# 将 packages/example/dist/ 复制进去

# 5. 在应用中点击"启动小程序"按钮
```

---

## 📦 小程序编译

所有演示项目共用同一个小程序示例：

```bash
# 编译示例小程序
cd packages/compiler
node dist/cli.js build \
  --appId com.example.dualler-demo \
  --entry ../example/src/app.vue \
  --pages ../example/src/pages/index/index.vue,../example/src/pages/detail/detail.vue,../example/src/pages/profile/profile.vue \
  --outputDir ../example/dist
```

编译产物：
```
packages/example/dist/
├── app.js
├── manifest.json
└── pages/
    ├── index/    (index.js + index.html + index.css)
    ├── detail/   (detail.js + detail.html + detail.css)
    └── profile/  (profile.js + profile.html + profile.css)
```

---

## 🔧 故障排除

### Android: "小程序包不存在"

确保已推送小程序包到设备：
```bash
adb push packages/example/dist/ /sdcard/dualler/packages/com.example.dualler-demo/
```

### iOS: "首页文件不存在"

确保已复制小程序包到应用的 Documents 目录。

### Web: 页面空白

检查浏览器控制台是否有错误，确保 JavaScript 已启用。
