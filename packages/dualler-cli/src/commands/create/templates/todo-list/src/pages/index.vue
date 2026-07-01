<template>
  <view class="container">
    <text class="title">Todo List</text>
    <view class="list">
      <block v-for="(item, index) in todos" :key="index">
        <navigator url="/pages/detail?id={{item.id}}" hover-class="navigator-hover">
          <view class="item">
            <text>{{item.text}}</text>
            <text class="status">{{item.done ? 'done' : 'pending'}}</text>
          </view>
        </navigator>
      </block>
    </view>
    <view class="footer" bindtap="addTodo">
      <text>+ Add Todo</text>
    </view>
  </view>
</template>

<script setup lang="ts">
import { definePage } from '@dualler/runtime-api';

const todos = defineData({
  initial: [
    { id: 1, text: 'Learn Dualler', done: false },
    { id: 2, text: 'Build a mini-program', done: true },
  ],
});

function addTodo() {
  const id = (todos.value.length + 1);
  todos.value.push({ id, text: 'New Todo', done: false });
}

definePage({
  data: todos,
  addTodo,
});
</script>

<style>
.container {
  padding: 30rpx;
}

.title {
  font-size: 48rpx;
  font-weight: bold;
  margin-bottom: 30rpx;
}

.item {
  padding: 20rpx;
  border-bottom: 1rpx solid #eee;
  flex-direction: row;
  justify-content: space-between;
}

.status {
  color: #999;
}

.footer {
  margin-top: 30rpx;
  padding: 20rpx;
  background: #4a90d9;
  color: #fff;
  text-align: center;
  border-radius: 8rpx;
}
</style>
