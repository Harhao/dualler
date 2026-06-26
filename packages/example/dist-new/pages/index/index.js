// Dualler Page: Index
// Auto-generated wrapper for mini-program Page constructor
(function() {
  // === User script start ===
  
import { __dualler_ref as ref, __dualler_computed as computed } from "dualler://runtime";

// 计数器
const count = __dualler_ref(0);

function increment() {
  count.value++;
  wx.showToast({ title: `计数: ${count.value}` });
}

function decrement() {
  if (count.value > 0) {
    count.value--;
  }
}

function reset() {
  count.value = 0;
  wx.showToast({ title: '已重置' });
}

// 待办事项
const newTodo = __dualler_ref('');
const todos = __dualler_ref([
{ text: '学习 Dualler 框架', done: false },
{ text: '编写小程序示例', done: false },
{ text: '测试跨平台功能', done: false }]
);

function onInput(e) {
  newTodo.value = e.detail.value;
}

function addTodo() {
  if (newTodo.value.trim()) {
    todos.value.push({
      text: newTodo.value.trim(),
      done: false
    });
    newTodo.value = '';
    wx.showToast({ title: '添加成功' });
  }
}

function toggleTodo(index) {
  todos.value[index].done = !todos.value[index].done;
}

function removeTodo(index) {
  todos.value.splice(index, 1);
  wx.showToast({ title: '已删除' });
}

// API 示例
const systemInfo = __dualler_ref(null);

function showToast() {
  wx.showToast({
    title: '这是一个 Toast 提示',
    duration: 2000
  });
}

function getSystemInfo() {
  wx.getSystemInfo({
    success(res) {
      systemInfo.value = res;
    }
  });
}

function navigateToDetail() {
  wx.navigateTo({
    url: '/pages/detail/detail?id=1&title=示例详情'
  });
}
  // === User script end ===

  // Helper to unwrap ref values
  function __dualler_unwrap(val) {
    return val != null && typeof val === 'object' && 'value' in val ? val.value : val;
  }

  // Collect reactive data for setData
  var __dualler_data__ = {
      count: __dualler_unwrap(count),
      newTodo: __dualler_unwrap(newTodo),
      todos: __dualler_unwrap(todos),
      systemInfo: __dualler_unwrap(systemInfo),
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