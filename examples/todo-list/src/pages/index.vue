<template>
  <view class="page">
    <text class="title">Todo List</text>
    <view class="list">
      <block v-for="(item, i) in todos" :key="i">
        <view class="item">
          <text>{{ item.text }}</text>
          <text class="tag">{{ item.done ? 'done' : 'todo' }}</text>
        </view>
      </block>
    </view>
    <button class="add-btn" bindtap="addTodo">Add Todo</button>
  </view>
</template>

<script setup lang="ts">
import { definePage } from '@dualler/runtime-api';

definePage({
  data: {
    todos: [
      { text: 'Learn Dualler', done: false },
      { text: 'Build something cool', done: true },
    ],
  },
  addTodo() {
    console.log('Add todo clicked');
  },
  onReady() {
    console.log('Todo list ready');
  },
});
</script>

<style>
.page {
  padding: 30rpx;
}

.title {
  font-size: 44rpx;
  font-weight: bold;
  margin-bottom: 30rpx;
}

.item {
  flex-direction: row;
  justify-content: space-between;
  padding: 16rpx 0;
  border-bottom: 1rpx solid #eee;
}

.tag {
  color: #999;
}

.add-btn {
  margin-top: 40rpx;
  background-color: #4a90d9;
  color: #fff;
}
</style>
