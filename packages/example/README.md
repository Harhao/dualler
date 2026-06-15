# Dualler 示例小程序

这是一个完整的 Dualler 小程序示例，展示了框架的主要功能。

## 功能特性

- ✅ Vue3 Composition API（ref、computed、watch）
- ✅ 事件处理（tap、input）
- ✅ 数据绑定（文本、属性）
- ✅ 列表渲染（v-for）
- ✅ 条件渲染（v-if）
- ✅ 自定义组件
- ✅ 页面导航（navigateTo、navigateBack）
- ✅ Toast/Modal 弹窗
- ✅ 本地存储（getStorageSync、setStorageSync）
- ✅ 网络请求（wx.request）
- ✅ 设备信息（wx.getSystemInfo）
- ✅ Worker 线程
- ✅ 分包配置
- ✅ 域名白名单

## 目录结构

```
example/
├── app.json                    # 应用配置
├── src/
│   ├── app.vue                 # 应用入口
│   ├── pages/
│   │   ├── index/
│   │   │   └── index.vue       # 首页（计数器、待办、API 示例）
│   │   ├── detail/
│   │   │   └── detail.vue      # 详情页（表单、图片、同层渲染）
│   │   └── profile/
│   │       └── profile.vue     # 个人页（存储、网络、Worker）
│   └── components/
│       └── Counter.vue         # 自定义计数器组件
└── workers/
    └── sort.js                 # Worker 脚本示例
```

## 编译运行

```bash
# 使用编译器编译
cd packages/compiler
npm install && npm run build

node dist/cli.js build \
  --appId com.example.dualler-demo \
  --entry ../example/src/app.vue \
  --pages ../example/src/pages/index/index.vue,../example/src/pages/detail/detail.vue,../example/src/pages/profile/profile.vue \
  --outputDir ../example/dist

# 或使用 Gradle 插件
./gradlew compileDualler
```

## 页面说明

### 首页（index）

- **计数器**：演示 ref 响应式数据和事件处理
- **待办事项**：演示列表渲染、条件渲染、表单输入
- **API 示例**：演示 Toast、设备信息、页面跳转

### 详情页（detail）

- **图片网格**：演示图片组件和 mode 属性
- **表单**：演示输入框、文本域、表单提交
- **同层渲染占位**：演示 video/map 原生组件

### 个人页（profile）

- **本地存储**：演示 getStorageSync/setStorageSync
- **网络请求**：演示 wx.request
- **Worker 测试**：演示 CPU 密集计算
- **弹窗示例**：演示 wx.showModal

## 自定义组件

### Counter 组件

```vue
<template>
  <Counter label="数量" :initialValue="0" :min="0" :max="100" @update="onUpdate" />
</template>

<script setup>
import Counter from '@/components/Counter.vue'

function onUpdate(value) {
  console.log('计数器更新:', value)
}
</script>
```

## 配置说明

### app.json

```json
{
  "appId": "com.example.dualler-demo",
  "appName": "Dualler 示例",
  "pages": [...],
  "window": {...},
  "tabBar": {...},
  "subpackages": [...],
  "domainWhitelist": {...}
}
```

### 域名白名单

```json
{
  "domainWhitelist": {
    "request": [
      "https://api.example.com",
      "https://*.cdn.example.com"
    ]
  }
}
```

## 注意事项

1. 所有网络请求必须在白名单域名内
2. rpx 单位会自动转换为 vw
3. Worker 脚本不能调用 wx.* API
4. 同层渲染组件（video/map）需要原生支持
