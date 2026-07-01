<script setup lang="ts">
import { ref } from 'vue'

const todos = ref<Array<{ text: string; done: boolean }>>([])
const input = ref('')

function addTodo() {
  if (input.value.trim()) {
    todos.value = [...todos.value, { text: input.value, done: false }]
    input.value = ''
  }
}
</script>

<template>
  <view class="container">
    <text class="title">Todo List</text>
    <view class="input-row">
      <input class="input" placeholder="Add a todo" value="{{ input }}" bindinput="onInput" />
      <button class="add-btn" bindtap="addTodo">Add</button>
    </view>
    <view class="list">
      <view class="item" wx:for="{{ todos }}" wx:key="index">
        <text>{{ item.text }}{{ item.done ? ' (done)' : '' }}</text>
      </view>
    </view>
  </view>
</template>

<style>
.container {
  padding: 20px;
}

.title {
  font-size: 36px;
  font-weight: bold;
  margin-bottom: 20px;
}
</style>
