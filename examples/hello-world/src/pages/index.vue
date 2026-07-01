<template>
  <view class="page">
    <text class="greeting">Hello, Dualler!</text>
    <text class="subtitle">This is the hello-world example.</text>
  </view>
</template>

<script setup lang="ts">
import { definePage } from '@dualler/runtime-api';

definePage({
  onReady() {
    console.log('Hello world page mounted');
  },
});
</script>

<style>
.page {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40rpx;
}

.greeting {
  font-size: 48rpx;
  font-weight: bold;
  color: #333;
  margin-bottom: 16rpx;
}

.subtitle {
  font-size: 28rpx;
  color: #888;
}
</style>
