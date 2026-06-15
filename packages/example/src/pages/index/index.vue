<template>
  <view class="container">
    <!-- 头部 -->
    <view class="header">
      <text class="title">Dualler 示例</text>
      <text class="subtitle">Vue3 小程序引擎</text>
    </view>

    <!-- 计数器示例 -->
    <view class="card">
      <text class="card-title">计数器</text>
      <text class="count">{{ count }}</text>
      <view class="btn-group">
        <button class="btn btn-primary" @tap="increment">+1</button>
        <button class="btn btn-secondary" @tap="decrement">-1</button>
        <button class="btn btn-danger" @tap="reset">重置</button>
      </view>
    </view>

    <!-- 列表示例 -->
    <view class="card">
      <text class="card-title">待办事项</text>
      <view class="input-group">
        <input
          class="input"
          placeholder="添加新任务"
          :value="newTodo"
          @input="onInput"
        />
        <button class="btn btn-primary" @tap="addTodo">添加</button>
      </view>
      <view class="todo-list">
        <view
          v-for="(todo, index) in todos"
          :key="index"
          class="todo-item"
        >
          <text :class="{ 'todo-done': todo.done }">{{ todo.text }}</text>
          <view class="todo-actions">
            <button class="btn btn-sm" @tap="toggleTodo(index)">
              {{ todo.done ? '撤销' : '完成' }}
            </button>
            <button class="btn btn-sm btn-danger" @tap="removeTodo(index)">
              删除
            </button>
          </view>
        </view>
      </view>
      <text v-if="todos.length === 0" class="empty">暂无任务</text>
    </view>

    <!-- API 示例 -->
    <view class="card">
      <text class="card-title">API 示例</text>
      <button class="btn btn-block" @tap="showToast">显示 Toast</button>
      <button class="btn btn-block" @tap="getSystemInfo">获取设备信息</button>
      <button class="btn btn-block" @tap="navigateToDetail">跳转详情页</button>
    </view>

    <!-- 设备信息 -->
    <view v-if="systemInfo" class="card">
      <text class="card-title">设备信息</text>
      <view class="info-item">
        <text class="info-label">品牌：</text>
        <text class="info-value">{{ systemInfo.brand }}</text>
      </view>
      <view class="info-item">
        <text class="info-label">型号：</text>
        <text class="info-value">{{ systemInfo.model }}</text>
      </view>
      <view class="info-item">
        <text class="info-label">屏幕：</text>
        <text class="info-value">{{ systemInfo.screenWidth }} x {{ systemInfo.screenHeight }}</text>
      </view>
      <view class="info-item">
        <text class="info-label">语言：</text>
        <text class="info-value">{{ systemInfo.language }}</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'

// 计数器
const count = ref(0)

function increment() {
  count.value++
  wx.showToast({ title: `计数: ${count.value}` })
}

function decrement() {
  if (count.value > 0) {
    count.value--
  }
}

function reset() {
  count.value = 0
  wx.showToast({ title: '已重置' })
}

// 待办事项
const newTodo = ref('')
const todos = ref([
  { text: '学习 Dualler 框架', done: false },
  { text: '编写小程序示例', done: false },
  { text: '测试跨平台功能', done: false }
])

function onInput(e) {
  newTodo.value = e.detail.value
}

function addTodo() {
  if (newTodo.value.trim()) {
    todos.value.push({
      text: newTodo.value.trim(),
      done: false
    })
    newTodo.value = ''
    wx.showToast({ title: '添加成功' })
  }
}

function toggleTodo(index) {
  todos.value[index].done = !todos.value[index].done
}

function removeTodo(index) {
  todos.value.splice(index, 1)
  wx.showToast({ title: '已删除' })
}

// API 示例
const systemInfo = ref(null)

function showToast() {
  wx.showToast({
    title: '这是一个 Toast 提示',
    duration: 2000
  })
}

function getSystemInfo() {
  wx.getSystemInfo({
    success(res) {
      systemInfo.value = res
    }
  })
}

function navigateToDetail() {
  wx.navigateTo({
    url: '/pages/detail/detail?id=1&title=示例详情'
  })
}
</script>

<style scoped>
.container {
  padding: 20rpx;
  padding-bottom: 120rpx;
}

.header {
  text-align: center;
  padding: 40rpx 0;
}

.title {
  font-size: 48rpx;
  font-weight: bold;
  color: #1a73e8;
}

.subtitle {
  display: block;
  font-size: 28rpx;
  color: #666;
  margin-top: 10rpx;
}

.card {
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.card-title {
  font-size: 32rpx;
  font-weight: bold;
  margin-bottom: 20rpx;
}

.count {
  display: block;
  text-align: center;
  font-size: 72rpx;
  font-weight: bold;
  color: #1a73e8;
  margin: 20rpx 0;
}

.btn-group {
  display: flex;
  gap: 20rpx;
}

.btn {
  flex: 1;
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

.btn-secondary {
  background: #6c757d;
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

.btn-sm {
  padding: 8rpx 16rpx;
  font-size: 24rpx;
}

.input-group {
  display: flex;
  gap: 16rpx;
  margin-bottom: 20rpx;
}

.input {
  flex: 1;
  padding: 16rpx;
  border: 1px solid #ddd;
  border-radius: 8rpx;
  font-size: 28rpx;
}

.todo-list {
  margin-top: 16rpx;
}

.todo-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16rpx 0;
  border-bottom: 1px solid #eee;
}

.todo-done {
  text-decoration: line-through;
  color: #999;
}

.todo-actions {
  display: flex;
  gap: 10rpx;
}

.empty {
  text-align: center;
  color: #999;
  padding: 20rpx;
}

.info-item {
  display: flex;
  padding: 10rpx 0;
  border-bottom: 1px solid #f0f0f0;
}

.info-label {
  color: #666;
  width: 120rpx;
}

.info-value {
  color: #333;
  flex: 1;
}
</style>
