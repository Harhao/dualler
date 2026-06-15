<template>
  <view class="counter">
    <text class="label">{{ label }}</text>
    <view class="controls">
      <button class="btn" @tap="decrement">-</button>
      <text class="value">{{ count }}</text>
      <button class="btn" @tap="increment">+</button>
    </view>
  </view>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  label: {
    type: String,
    default: '计数器'
  },
  initialValue: {
    type: Number,
    default: 0
  },
  min: {
    type: Number,
    default: -Infinity
  },
  max: {
    type: Number,
    default: Infinity
  }
})

const emit = defineEmits(['update'])

const count = ref(props.initialValue)

function increment() {
  if (count.value < props.max) {
    count.value++
    emit('update', count.value)
  }
}

function decrement() {
  if (count.value > props.min) {
    count.value--
    emit('update', count.value)
  }
}

watch(() => props.initialValue, (newVal) => {
  count.value = newVal
})
</script>

<style scoped>
.counter {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16rpx;
  background: #f8f9fa;
  border-radius: 8rpx;
}

.label {
  font-size: 28rpx;
  color: #333;
}

.controls {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.btn {
  width: 60rpx;
  height: 60rpx;
  border-radius: 30rpx;
  background: #1a73e8;
  color: #fff;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 32rpx;
  border: none;
}

.value {
  font-size: 36rpx;
  font-weight: bold;
  min-width: 80rpx;
  text-align: center;
}
</style>
