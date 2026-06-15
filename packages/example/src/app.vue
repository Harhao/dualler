<script setup>
import { onLaunch, onShow, onHide } from 'vue'

onLaunch(() => {
  console.log('App Launch')
})

onShow(() => {
  console.log('App Show')
})

onHide(() => {
  console.log('App Hide')
})
</script>

<style>
page {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  font-size: 28rpx;
  color: #333;
  background-color: #f5f5f5;
}
</style>
