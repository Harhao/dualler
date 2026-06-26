<template>
  <view class="container">
    <!-- 用户信息 -->
    <view class="user-card">
      <view class="avatar">
        <text class="avatar-text">{{ user.name.charAt(0) }}</text>
      </view>
      <view class="user-info">
        <text class="user-name">{{ user.name }}</text>
        <text class="user-id">ID: {{ user.id }}</text>
      </view>
    </view>

    <!-- 功能列表 -->
    <view class="menu-card">
      <view class="menu-item" @tap="showStorage">
        <text class="menu-text">本地存储</text>
        <text class="menu-arrow">›</text>
      </view>
      <view class="menu-item" @tap="showNetwork">
        <text class="menu-text">网络请求</text>
        <text class="menu-arrow">›</text>
      </view>
      <view class="menu-item" @tap="testWorker">
        <text class="menu-text">Worker 测试</text>
        <text class="menu-arrow">›</text>
      </view>
      <view class="menu-item" @tap="showModal">
        <text class="menu-text">弹窗示例</text>
        <text class="menu-arrow">›</text>
      </view>
    </view>

    <!-- 存储示例 -->
    <view v-if="showStoragePanel" class="card">
      <text class="card-title">本地存储</text>
      <view class="storage-item">
        <input class="input" placeholder="输入 Key" :value="storageKey" @input="onKeyInput" />
        <input class="input" placeholder="输入 Value" :value="storageValue" @input="onValueInput" />
        <button class="btn btn-primary" @tap="saveStorage">保存</button>
      </view>
      <button class="btn btn-block" @tap="readStorage">读取</button>
      <button class="btn btn-block btn-danger" @tap="clearStorage">清空</button>
      <text v-if="storageResult" class="result">{{ storageResult }}</text>
    </view>

    <!-- 网络请求示例 -->
    <view v-if="showNetworkPanel" class="card">
      <text class="card-title">网络请求</text>
      <button class="btn btn-block" @tap="makeRequest">发送 GET 请求</button>
      <view v-if="networkResult" class="network-result">
        <text class="result-title">响应：</text>
        <text class="result-content">{{ networkResult }}</text>
      </view>
    </view>

    <!-- Worker 测试 -->
    <view v-if="showWorkerPanel" class="card">
      <text class="card-title">Worker 测试</text>
      <text class="worker-desc">使用 Worker 进行 CPU 密集计算</text>
      <button class="btn btn-block" @tap="runWorker">运行排序任务</button>
      <view v-if="workerResult" class="worker-result">
        <text class="result-title">结果：</text>
        <text class="result-content">{{ workerResult }}</text>
      </view>
    </view>

    <!-- 版本信息 -->
    <view class="version-card">
      <text class="version">Dualler SDK v1.0.0</text>
      <text class="platform">平台: {{ platform }}</text>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'

// 用户信息
const user = ref({
  id: '10001',
  name: 'Dualler 用户'
})

// 存储示例
const showStoragePanel = ref(false)
const storageKey = ref('')
const storageValue = ref('')
const storageResult = ref('')

function showStorage() {
  showStoragePanel.value = !showStoragePanel.value
}

function onKeyInput(e) {
  storageKey.value = e.detail.value
}

function onValueInput(e) {
  storageValue.value = e.detail.value
}

function saveStorage() {
  if (storageKey.value && storageValue.value) {
    wx.setStorageSync(storageKey.value, storageValue.value)
    storageResult.value = `已保存: ${storageKey.value} = ${storageValue.value}`
    wx.showToast({ title: '保存成功' })
  }
}

function readStorage() {
  if (storageKey.value) {
    const value = wx.getStorageSync(storageKey.value)
    storageResult.value = value ? `读取: ${storageKey.value} = ${value}` : '未找到'
  }
}

function clearStorage() {
  wx.clearStorageSync()
  storageResult.value = '已清空所有存储'
  wx.showToast({ title: '已清空' })
}

// 网络请求示例
const showNetworkPanel = ref(false)
const networkResult = ref('')

function showNetwork() {
  showNetworkPanel.value = !showNetworkPanel.value
}

function makeRequest() {
  networkResult.value = '请求中...'
  wx.request({
    url: 'https://jsonplaceholder.typicode.com/posts/1',
    method: 'GET',
    success(res) {
      networkResult.value = JSON.stringify(res.data, null, 2)
    },
    fail(err) {
      networkResult.value = '请求失败: ' + err.errMsg
    }
  })
}

// Worker 测试
const showWorkerPanel = ref(false)
const workerResult = ref('')

function testWorker() {
  showWorkerPanel.value = !showWorkerPanel.value
}

function runWorker() {
  workerResult.value = '计算中...'

  // 生成随机数组
  const arr = Array.from({ length: 10000 }, () => Math.random() * 10000)

  // 模拟 Worker 排序
  const start = Date.now()
  const sorted = arr.sort((a, b) => a - b)
  const end = Date.now()

  workerResult.value = `排序完成\n耗时: ${end - start}ms\n前10个: ${sorted.slice(0, 10).map(n => n.toFixed(2)).join(', ')}`
}

// 弹窗示例
function showModal() {
  wx.showModal({
    title: '提示',
    content: '这是一个模态弹窗',
    showCancel: true,
    success(res) {
      if (res.confirm) {
        wx.showToast({ title: '点击了确定' })
      } else if (res.cancel) {
        wx.showToast({ title: '点击了取消' })
      }
    }
  })
}

// 平台信息
const platform = ref('web')
</script>

<style scoped>
.container {
  padding: 20rpx;
  padding-bottom: 120rpx;
}

.user-card {
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, #1a73e8, #4a90d9);
  border-radius: 16rpx;
  padding: 40rpx;
  margin-bottom: 20rpx;
}

.avatar {
  width: 120rpx;
  height: 120rpx;
  border-radius: 60rpx;
  background: rgba(255, 255, 255, 0.3);
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 30rpx;
}

.avatar-text {
  font-size: 48rpx;
  color: #fff;
  font-weight: bold;
}

.user-info {
  flex: 1;
}

.user-name {
  font-size: 36rpx;
  font-weight: bold;
  color: #fff;
}

.user-id {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.8);
  margin-top: 8rpx;
}

.menu-card {
  background: #fff;
  border-radius: 16rpx;
  margin-bottom: 20rpx;
  overflow: hidden;
}

.menu-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30rpx;
  border-bottom: 1px solid #f0f0f0;
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-text {
  font-size: 30rpx;
}

.menu-arrow {
  font-size: 36rpx;
  color: #999;
}

.card {
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
}

.card-title {
  font-size: 32rpx;
  font-weight: bold;
  margin-bottom: 20rpx;
}

.storage-item {
  margin-bottom: 20rpx;
}

.input {
  width: 100%;
  padding: 16rpx;
  border: 1px solid #ddd;
  border-radius: 8rpx;
  font-size: 28rpx;
  margin-bottom: 16rpx;
}

.btn {
  padding: 16rpx 24rpx;
  border-radius: 8rpx;
  font-size: 28rpx;
  text-align: center;
  border: none;
}

.btn-primary {
  background: #1a73e8;
  color: #fff;
}

.btn-danger {
  background: #dc3545;
  color: #fff;
}

.btn-block {
  display: block;
  width: 100%;
  margin-bottom: 16rpx;
}

.result {
  display: block;
  margin-top: 16rpx;
  padding: 16rpx;
  background: #f5f5f5;
  border-radius: 8rpx;
  font-size: 24rpx;
  color: #333;
}

.network-result {
  margin-top: 16rpx;
}

.result-title {
  font-weight: bold;
  margin-bottom: 8rpx;
}

.result-content {
  font-size: 24rpx;
  color: #666;
  word-break: break-all;
}

.worker-desc {
  font-size: 24rpx;
  color: #666;
  margin-bottom: 16rpx;
}

.worker-result {
  margin-top: 16rpx;
}

.version-card {
  text-align: center;
  padding: 40rpx;
}

.version {
  font-size: 24rpx;
  color: #999;
}

.platform {
  display: block;
  font-size: 20rpx;
  color: #ccc;
  margin-top: 8rpx;
}
</style>
