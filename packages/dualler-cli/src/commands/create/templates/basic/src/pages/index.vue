<template>
  <view class="container">
    <text class="title">Hello, Dualler!</text>
    <text>Welcome to your first mini-program.</text>
  </view>
</template>

<script setup lang="ts">
import { definePage } from '@dualler/runtime-api';

definePage({
  onReady() {
    console.log('Home page ready');
  },
});
</script>

<style>
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40rpx;
}

.title {
  font-size: 48rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 20rpx;
}
</style>
