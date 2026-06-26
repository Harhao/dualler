// Dualler Page: Profile
// Auto-generated wrapper for mini-program Page constructor
(function() {
  // === User script start ===
  
import { __dualler_ref as ref } from "dualler://runtime";

// 用户信息
const user = __dualler_ref({
  id: '10001',
  name: 'Dualler 用户'
});

// 存储示例
const showStoragePanel = __dualler_ref(false);
const storageKey = __dualler_ref('');
const storageValue = __dualler_ref('');
const storageResult = __dualler_ref('');

function showStorage() {
  showStoragePanel.value = !showStoragePanel.value;
}

function onKeyInput(e) {
  storageKey.value = e.detail.value;
}

function onValueInput(e) {
  storageValue.value = e.detail.value;
}

function saveStorage() {
  if (storageKey.value && storageValue.value) {
    wx.setStorageSync(storageKey.value, storageValue.value);
    storageResult.value = `已保存: ${storageKey.value} = ${storageValue.value}`;
    wx.showToast({ title: '保存成功' });
  }
}

function readStorage() {
  if (storageKey.value) {
    const value = wx.getStorageSync(storageKey.value);
    storageResult.value = value ? `读取: ${storageKey.value} = ${value}` : '未找到';
  }
}

function clearStorage() {
  wx.clearStorageSync();
  storageResult.value = '已清空所有存储';
  wx.showToast({ title: '已清空' });
}

// 网络请求示例
const showNetworkPanel = __dualler_ref(false);
const networkResult = __dualler_ref('');

function showNetwork() {
  showNetworkPanel.value = !showNetworkPanel.value;
}

function makeRequest() {
  networkResult.value = '请求中...';
  wx.request({
    url: 'https://jsonplaceholder.typicode.com/posts/1',
    method: 'GET',
    success(res) {
      networkResult.value = JSON.stringify(res.data, null, 2);
    },
    fail(err) {
      networkResult.value = '请求失败: ' + err.errMsg;
    }
  });
}

// Worker 测试
const showWorkerPanel = __dualler_ref(false);
const workerResult = __dualler_ref('');

function testWorker() {
  showWorkerPanel.value = !showWorkerPanel.value;
}

function runWorker() {
  workerResult.value = '计算中...';

  // 生成随机数组
  const arr = Array.from({ length: 10000 }, () => Math.random() * 10000);

  // 模拟 Worker 排序
  const start = Date.now();
  const sorted = arr.sort((a, b) => a - b);
  const end = Date.now();

  workerResult.value = `排序完成\n耗时: ${end - start}ms\n前10个: ${sorted.slice(0, 10).map((n) => n.toFixed(2)).join(', ')}`;
}

// 弹窗示例
function showModal() {
  wx.showModal({
    title: '提示',
    content: '这是一个模态弹窗',
    showCancel: true,
    success(res) {
      if (res.confirm) {
        wx.showToast({ title: '点击了确定' });
      } else if (res.cancel) {
        wx.showToast({ title: '点击了取消' });
      }
    }
  });
}

// 平台信息
const platform = __dualler_ref('web');
  // === User script end ===

  // Helper to unwrap ref values
  function __dualler_unwrap(val) {
    return val != null && typeof val === 'object' && 'value' in val ? val.value : val;
  }

  // Collect reactive data for setData
  var __dualler_data__ = {
      user: __dualler_unwrap(user),
      showStoragePanel: __dualler_unwrap(showStoragePanel),
      storageKey: __dualler_unwrap(storageKey),
      storageValue: __dualler_unwrap(storageValue),
      storageResult: __dualler_unwrap(storageResult),
      showNetworkPanel: __dualler_unwrap(showNetworkPanel),
      networkResult: __dualler_unwrap(networkResult),
      showWorkerPanel: __dualler_unwrap(showWorkerPanel),
      workerResult: __dualler_unwrap(workerResult),
      platform: __dualler_unwrap(platform),
  };

  // Create Page
  Page({
    data: __dualler_data__,

    onLoad: function(options) {
      if (typeof __dualler_onBeforeMount === 'function') __dualler_onBeforeMount(options);
    },

    onReady: function() {
      if (typeof __dualler_onReady === 'function') __dualler_onReady();
    },

    onShow: function() {
      if (typeof __dualler_onShow === 'function') __dualler_onShow();
    },

    onHide: function() {
      if (typeof __dualler_onHide === 'function') __dualler_onHide();
    },

    onUnload: function() {
      if (typeof __dualler_onBeforeUnload === 'function') __dualler_onBeforeUnload();
      if (typeof __dualler_onUnload === 'function') __dualler_onUnload();
    },

    onError: function(err) {
      if (typeof __dualler_onErrorCaptured === 'function') __dualler_onErrorCaptured(err);
    },
  });
})();