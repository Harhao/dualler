<template>
  <view class="container">
    <text class="title">{{todo?.text || 'Detail'}}</text>
    <text>ID: {{id}}</text>
    <button type="primary" bindtap="goBack">Back</button>
  </view>
</template>

<script setup lang="ts">
import { definePage } from '@dualler/runtime-api';

const todos = defineData({ initial: [] });
const id = defineData({ initial: 0 });
const todo = defineData({ initial: null });

function goBack() {
  wx.navigateBack();
}

definePage({
  data: { todos, id, todo },
  onShow() {
    const query = wx.getStorageSync('detailQuery') || {};
    const detailId = Number(query.id) || 0;
    id.value = detailId;
    const found = todos.value.find((t) => t.id === detailId);
    if (found) {
      todo.value = found;
    }
  },
  goBack,
});
</script>

<style>
.container {
  padding: 30rpx;
}

.title {
  font-size: 40rpx;
  font-weight: bold;
  margin-bottom: 20rpx;
}
</style>
