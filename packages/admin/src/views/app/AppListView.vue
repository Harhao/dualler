<template>
  <div class="app-list">
    <div class="header">
      <h2>小程序管理</h2>
      <el-button type="primary" @click="showCreateDialog = true">创建小程序</el-button>
    </div>

    <el-table :data="apps" style="width: 100%">
      <el-table-column prop="appId" label="App ID" />
      <el-table-column prop="appName" label="名称" />
      <el-table-column prop="status" label="状态">
        <template #default="{ row }">
          <el-tag :type="row.status === 'active' ? 'success' : 'info'">{{ row.status }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="创建时间" />
      <el-table-column label="操作">
        <template #default="{ row }">
          <el-button size="small" @click="viewDetail(row.id)">详情</el-button>
          <el-button size="small" type="danger" @click="handleDelete(row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="showCreateDialog" title="创建小程序">
      <el-form :model="createForm">
        <el-form-item label="App ID">
          <el-input v-model="createForm.appId" />
        </el-form-item>
        <el-form-item label="名称">
          <el-input v-model="createForm.appName" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="createForm.description" type="textarea" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" @click="handleCreate">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAppStore } from '../../stores/app';
import { appApi } from '../../api/app';
import { ElMessage } from 'element-plus';

const router = useRouter();
const appStore = useAppStore();
const apps = ref<any[]>([]);
const showCreateDialog = ref(false);
const createForm = ref({ appId: '', appName: '', description: '' });

onMounted(async () => {
  await appStore.fetchApps();
  apps.value = appStore.apps;
});

async function handleCreate() {
  try {
    await appApi.create(createForm.value);
    ElMessage.success('创建成功');
    showCreateDialog.value = false;
    await appStore.fetchApps();
    apps.value = appStore.apps;
  } catch (e) {
    ElMessage.error('创建失败');
  }
}

function viewDetail(id: string) {
  router.push(`/apps/${id}`);
}

async function handleDelete(id: string) {
  try {
    await appApi.delete(id);
    ElMessage.success('删除成功');
    await appStore.fetchApps();
    apps.value = appStore.apps;
  } catch (e) {
    ElMessage.error('删除失败');
  }
}
</script>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
</style>
