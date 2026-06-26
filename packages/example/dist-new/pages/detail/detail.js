// Dualler Page: Detail
// Auto-generated wrapper for mini-program Page constructor
(function() {
  // === User script start ===
  
import { __dualler_ref as ref, __dualler_onReady as onMounted } from "dualler://runtime";

// 获取页面参数
const id = __dualler_ref('');
const title = __dualler_ref('详情页');

__dualler_onReady(() => {
  // 模拟获取页面参数
  id.value = '1';
  title.value = '示例详情';
});

// 图片列表
const images = __dualler_ref([
'https://picsum.photos/200/200?random=1',
'https://picsum.photos/200/200?random=2',
'https://picsum.photos/200/200?random=3',
'https://picsum.photos/200/200?random=4']
);

// 表单数据
const form = __dualler_ref({
  name: '',
  email: '',
  message: ''
});

function onNameInput(e) {
  form.value.name = e.detail.value;
}

function onEmailInput(e) {
  form.value.email = e.detail.value;
}

function onMessageInput(e) {
  form.value.message = e.detail.value;
}

function submitForm() {
  if (!form.value.name || !form.value.email) {
    wx.showToast({ title: '请填写必填项' });
    return;
  }
  wx.showToast({ title: '提交成功' });
  console.log('Form data:', form.value);
}

function goBack() {
  wx.navigateBack();
}
  // === User script end ===

  // Helper to unwrap ref values
  function __dualler_unwrap(val) {
    return val != null && typeof val === 'object' && 'value' in val ? val.value : val;
  }

  // Collect reactive data for setData
  var __dualler_data__ = {
      id: __dualler_unwrap(id),
      title: __dualler_unwrap(title),
      images: __dualler_unwrap(images),
      form: __dualler_unwrap(form),
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