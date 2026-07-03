<template>
  <view class="page">
    <text class="title">Detail Page</text>
    <text>View details of a todo item.</text>
    <button bindtap="goBack">Back</button>
  </view>
</template>

<script setup lang="ts">
import { definePage } from '@dualler/runtime-api';

function goBack() {
  console.log('Back button tapped');
}

definePage({
  goBack,
  onShow() {
    console.log('Detail page shown');
  },
});
</script>

<style>
.page {
  padding: 30rpx;
}

.title {
  font-size: 40rpx;
  font-weight: bold;
  margin-bottom: 20rpx;
}
</style>
