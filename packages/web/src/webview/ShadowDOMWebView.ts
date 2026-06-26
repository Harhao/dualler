/**
 * Shadow DOM WebView
 *
 * 小程序 HTML 渲染在 Shadow DOM 中，实现样式隔离
 * 支持 JS 执行、CSS 注入、事件绑定
 */

import type { WebViewProvider, WebViewConfig } from '../types/platform';

export class ShadowDOMWebView implements WebViewProvider {
  private container: HTMLElement | null = null;
  private shadowRoot: ShadowRoot | null = null;
  private messageHandler: ((message: string) => void) | null = null;
  private ready = false;

  /**
   * 挂载到指定 DOM 元素
   */
  mount(elementId: string): void {
    this.container = document.getElementById(elementId);
    if (this.container) {
      this.shadowRoot = this.container.attachShadow({ mode: 'closed' });
    }
  }

  /**
   * 挂载到指定 DOM 元素
   */
  mountToElement(element: HTMLElement): void {
    this.container = element;
    this.shadowRoot = element.attachShadow({ mode: 'closed' });
  }

  loadUrl(url: string): void {
    fetch(url)
      .then(response => response.text())
      .then(html => this.loadHtml(html, url))
      .catch(error => console.error('Failed to load URL:', url, error));
  }

  loadHtml(html: string, baseUrl: string = ''): void {
    if (!this.shadowRoot) {
      console.error('ShadowRoot not initialized. Call mount() first.');
      return;
    }

    // 清空内容
    this.shadowRoot.innerHTML = '';

    // 注入基础样式
    const style = document.createElement('style');
    style.textContent = `
      :host {
        display: block;
        width: 100%;
        height: 100%;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        font-size: 14px;
        line-height: 1.5;
        color: #333;
        overflow: auto;
      }
      * { margin: 0; padding: 0; box-sizing: border-box; }
      view { display: block; }
      text { display: inline; }
      button {
        display: inline-block;
        padding: 8px 16px;
        border: 1px solid #ddd;
        border-radius: 4px;
        background: #fff;
        cursor: pointer;
        font-size: 14px;
      }
      button:active { background: #f0f0f0; }
      input, textarea {
        padding: 8px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 14px;
        width: 100%;
      }
      image { max-width: 100%; display: block; }
      scroll-view {
        display: block;
        overflow: auto;
        -webkit-overflow-scrolling: touch;
      }
      .container { padding: 16px; }
    `;
    this.shadowRoot.appendChild(style);

    // 创建内容容器
    const appContainer = document.createElement('div');
    appContainer.id = 'app';
    appContainer.innerHTML = html;
    this.shadowRoot.appendChild(appContainer);

    // 注入渲染引擎
    this.injectRenderEngine();

    // 注入 Bridge
    this.injectBridge();

    // 标记就绪
    this.ready = true;
    this.messageHandler?.(JSON.stringify({ type: 'ready' }));
  }

  evaluateJavascript(script: string, callback?: (result: string) => void): void {
    try {
      // 在 Shadow DOM 上下文中执行脚本
      const wrappedScript = `
        (function() {
          var app = document.querySelector('#app');
          ${script}
        })();
      `;

      const result = eval(wrappedScript);
      callback?.(JSON.stringify(result));
    } catch (error) {
      console.error('Script error:', error);
      callback?.('{}');
    }
  }

  addJavascriptInterface(name: string, handler: (message: string) => void): void {
    this.messageHandler = handler;

    // 在 window 上注册接口
    (window as any)[name] = {
      postMessage: (message: string) => {
        handler(message);
      }
    };
  }

  injectCSS(css: string): void {
    if (!this.shadowRoot) return;

    const style = document.createElement('style');
    style.textContent = css;
    this.shadowRoot.appendChild(style);
  }

  injectScript(script: string): void {
    if (!this.shadowRoot) return;

    const scriptEl = document.createElement('script');
    scriptEl.textContent = script;
    this.shadowRoot.appendChild(scriptEl);
  }

  configure(config: WebViewConfig): void {
    // WebView 配置在 Web 平台中由浏览器控制
  }

  setVisible(visible: boolean): void {
    if (this.container) {
      this.container.style.display = visible ? '' : 'none';
    }
  }

  destroy(): void {
    if (this.shadowRoot) {
      this.shadowRoot.innerHTML = '';
    }
    this.container = null;
    this.shadowRoot = null;
    this.messageHandler = null;
    this.ready = false;
  }

  /**
   * 发送消息到渲染层
   */
  postMessage(message: string): void {
    this.messageHandler?.(message);
  }

  /**
   * 检查是否就绪
   */
  isReady(): boolean {
    return this.ready;
  }

  /**
   * 注入渲染引擎
   */
  private injectRenderEngine(): void {
    const renderScript = `
      window.__dualler_render__ = {
        _vnode: null,

        patch: function(pageId, data) {
          var container = document.getElementById('app');
          if (!container) return;

          // 更新绑定的文本内容
          for (var key in data) {
            var elements = container.querySelectorAll('[data-bind-' + key + ']');
            elements.forEach(function(el) {
              el.textContent = data[key];
            });

            // 更新绑定的属性
            var attrElements = container.querySelectorAll('[data-attr-' + key + ']');
            attrElements.forEach(function(el) {
              var attr = el.getAttribute('data-attr-' + key);
              if (attr) el.setAttribute(attr, data[key]);
            });
          }
        },

        createElement: function(vnode) {
          if (typeof vnode === 'string' || typeof vnode === 'number') {
            return document.createTextNode(String(vnode));
          }
          if (!vnode || !vnode.tag) return document.createTextNode('');

          var el = document.createElement(vnode.tag);

          if (vnode.props) {
            for (var key in vnode.props) {
              if (key === 'class') {
                el.className = vnode.props[key];
              } else if (key === 'style') {
                el.style.cssText = vnode.props[key];
              } else if (key.startsWith('data-event-')) {
                var eventType = key.replace('data-event-', '');
                el.addEventListener(eventType, function(e) {
                  if (window.dualler) {
                    window.dualler.postMessage(JSON.stringify({
                      type: 'event',
                      event: eventType,
                      target: el.id || '',
                      detail: { value: e.target.value }
                    }));
                  }
                });
              } else {
                el.setAttribute(key, vnode.props[key]);
              }
            }
          }

          if (vnode.children) {
            vnode.children.forEach(function(child) {
              el.appendChild(window.__dualler_render__.createElement(child));
            });
          }

          return el;
        }
      };
    `;

    this.injectScript(renderScript);
  }

  /**
   * 注入 Bridge
   */
  private injectBridge(): void {
    const bridgeScript = `
      window.dualler = {
        postMessage: function(msg) {
          window.postMessage({ type: 'dualler', data: msg }, '*');
        }
      };

      // 监听来自主线程的消息
      window.addEventListener('message', function(e) {
        if (e.data && e.data.type === 'dualler') {
          try {
            var msg = JSON.parse(e.data.data);
            if (msg.type === 'setData' && window.__dualler_render__) {
              window.__dualler_render__.patch(msg.pageId, JSON.parse(msg.data));
            }
          } catch(err) {
            console.error('Message handling error:', err);
          }
        }
      });

      // 通知就绪
      if (window.dualler) {
        window.dualler.postMessage(JSON.stringify({ type: 'ready' }));
      }
    `;

    this.injectScript(bridgeScript);
  }
}
