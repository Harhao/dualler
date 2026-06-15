<template>
  <view class="container">
    <!-- 返回按钮 -->
    <view class="nav">
      <button class="back-btn" @tap="goBack">← 返回</button>
    </view>

    <!-- 详情内容 -->
    <view class="card">
      <text class="title">{{ title }}</text>
      <text class="id">ID: {{ id }}</text>
    </view>

    <!-- 图片示例 -->
    <view class="card">
      <text class="card-title">图片示例</text>
      <view class="image-grid">
        <image
          v-for="(img, index) in images"
          :key="index"
          :src="img"
          class="image-item"
          mode="aspectFill"
        />
      </view>
    </view>

    <!-- 表单示例 -->
    <view class="card">
      <text class="card-title">表单示例</text>
      <view class="form-item">
        <text class="label">姓名</text>
        <input class="input" placeholder="请输入姓名" :value="form.name" @input="onNameInput" />
      </view>
      <view class="form-item">
        <text class="label">邮箱</text>
        <input class="input" placeholder="请输入邮箱" :value="form.email" @input="onEmailInput" />
      </view>
      <view class="form-item">
        <text class="label">留言</text>
        <textarea class="textarea" placeholder="请输入留言" :value="form.message" @input="onMessageInput" />
      </view>
      <button class="btn btn-primary btn-block" @tap="submitForm">提交</button>
    </view>

    <!-- 视频占位 -->
    <view class="card">
      <text class="card-title">视频组件（同层渲染）</text>
      <view class="video-placeholder">
        <text>视频播放区域</text>
        <text class="video-note">原生 VideoView 覆盖渲染</text>
      </view>
    </view>

    <!-- 地图占位 -->
    <view class="card">
      <text class="card-title">地图组件（同层渲染）</text>
      <view class="map-placeholder">
        <text>地图显示区域</text>
        <text class="map-note">原生 MapView 覆盖渲染</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'

// 获取页面参数
const id = ref('')
const title = ref('详情页')

onMounted(() => {
  // 模拟获取页面参数
  id.value = '1'
  title.value = '示例详情'
})

// 图片列表
const images = ref([
  'https://picsum.photos/200/200?random=1',
  'https://picsum.photos/200/200?random=2',
  'https://picsum.photos/200/200?random=3',
  'https://picsum.photos/200/200?random=4'
])

// 表单数据
const form = ref({
  name: '',
  email: '',
  message: ''
})

function onNameInput(e) {
  form.value.name = e.detail.value
}

function onEmailInput(e) {
  form.value.email = e.detail.value
}

function onMessageInput(e) {
  form.value.message = e.detail.value
}

function submitForm() {
  if (!form.value.name || !form.value.email) {
    wx.showToast({ title: '请填写必填项' })
    return
  }
  wx.showToast({ title: '提交成功' })
  console.log('Form data:', form.value)
}

function goBack() {
  wx.navigateBack()
}
</script>

<style scoped>
.container {
  padding: 20rpx;
}

.nav {
  margin-bottom: 20rpx;
}

.back-btn {
  background: none;
  border: none;
  color: #1a73e8;
  font-size: 28rpx;
  padding: 0;
}

.card {
  background: #fff;
  border-radius: 16rpx;
  padding: 30rpx;
  margin-bottom: 20rpx;
  box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
}

.title {
  font-size: 40rpx;
  font-weight: bold;
  margin-bottom: 10rpx;
}

.id {
  color: #666;
  font-size: 24rpx;
}

.card-title {
  font-size: 32rpx;
  font-weight: bold;
  margin-bottom: 20rpx;
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16rpx;
}

.image-item {
  width: 100%;
  height: 200rpx;
  border-radius: 8rpx;
}

.form-item {
  margin-bottom: 20rpx;
}

.label {
  display: block;
  font-size: 28rpx;
  color: #333;
  margin-bottom: 10rpx;
}

.input {
  width: 100%;
  padding: 16rpx;
  border: 1px solid #ddd;
  border-radius: 8rpx;
  font-size: 28rpx;
}

.textarea {
  width: 100%;
  padding: 16rpx;
  border: 1px solid #ddd;
  border-radius: 8rpx;
  font-size: 28rpx;
  height: 200rpx;
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

.btn-block {
  display: block;
  width: 100%;
  margin-top: 20rpx;
}

.video-placeholder,
.map-placeholder {
  width: 100%;
  height: 300rpx;
  background: #e0e0e0;
  border-radius: 8rpx;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.video-note,
.map-note {
  font-size: 24rpx;
  color: #666;
  margin-top: 10rpx;
}
</style>
