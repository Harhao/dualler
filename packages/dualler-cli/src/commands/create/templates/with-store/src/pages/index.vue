<template>
  <view class="container">
    <text class="title">Counter with Store</text>
    <text class="count">Count: {{ $store.state.count }}</text>
    <view class="actions">
      <button bindtap="increment">+</button>
      <button bindtap="decrement">-</button>
      <button bindtap="reset">Reset</button>
    </view>
  </view>
</template>

<script setup lang="ts">
import { definePage } from '@dualler/runtime-api';

definePage({
  onReady() {
    console.log('Counter page ready');
  },
});
</script>

<style>
.container {
  padding: 40rpx;
  align-items: center;
}

.title {
  font-size: 40rpx;
  font-weight: bold;
  margin-bottom: 40rpx;
}

.count {
  font-size: 60rpx;
  margin-bottom: 40rpx;
}

.actions {
  flex-direction: row;
}

.actions button {
  width: 160rpx;
  margin: 0 20rpx;
}
</style>
