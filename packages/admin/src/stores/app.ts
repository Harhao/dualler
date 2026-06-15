import { defineStore } from 'pinia';
import { ref } from 'vue';
import { appApi } from '../api/app';

export const useAppStore = defineStore('app', () => {
  const apps = ref<any[]>([]);
  const currentApp = ref<any>(null);

  async function fetchApps() {
    const res = await appApi.getList();
    apps.value = res.data.items;
  }

  async function fetchApp(id: string) {
    const res = await appApi.getDetail(id);
    currentApp.value = res.data;
  }

  return { apps, currentApp, fetchApps, fetchApp };
});
