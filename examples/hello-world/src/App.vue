<script setup lang="ts">
import { ref } from 'vue'

const message = ref('Hello Dualler!')
</script>

<template>
  <view class="container">
    <text class="title">{{ message }}</text>
  </view>
</template>

<style>
.container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.title {
  font-size: 32px;
  color: #333;
}
</style>
