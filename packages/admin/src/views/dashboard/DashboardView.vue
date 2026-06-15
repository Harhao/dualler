<template>
  <div class="dashboard">
    <h2>数据看板</h2>
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card>
          <div class="stat-item">
            <div class="stat-value">{{ stats.appCount }}</div>
            <div class="stat-label">小程序数量</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <div class="stat-item">
            <div class="stat-value">{{ stats.dau }}</div>
            <div class="stat-label">今日 DAU</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <div class="stat-item">
            <div class="stat-value">{{ stats.downloadCount }}</div>
            <div class="stat-label">今日下载</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card>
          <div class="stat-item">
            <div class="stat-value">{{ stats.versionCoverage }}%</div>
            <div class="stat-label">版本覆盖</div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const stats = ref({
  appCount: 12,
  dau: 1234,
  downloadCount: 456,
  versionCoverage: 98.5,
});
</script>

<style scoped>
.stat-item {
  text-align: center;
  padding: 20px;
}
.stat-value {
  font-size: 32px;
  font-weight: bold;
  color: #409eff;
}
.stat-label {
  margin-top: 10px;
  color: #666;
}
</style>
