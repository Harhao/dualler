/**
 * Virtual List runtime for WebView rendering.
 *
 * Efficiently renders long lists (1000+ items) by only rendering
 * visible items in the viewport. This reduces DOM node count and
 * improves scroll performance.
 *
 * Usage in template:
 *   <recycle-view :list="items" :item-height="50">
 *     <template #default="{ item, index }">
 *       <div>{{ item.name }}</div>
 *     </template>
 *   </recycle-view>
 */

export interface VirtualListOptions {
  /** Total number of items */
  total: number;
  /** Height of each item in pixels */
  itemHeight: number;
  /** Height of the container in pixels */
  containerHeight: number;
  /** Number of items to render outside viewport (buffer) */
  buffer?: number;
  /** Callback when visible range changes */
  onRangeChange?: (start: number, end: number) => void;
}

export class VirtualList {
  private container: HTMLElement;
  private itemHeight: number;
  private containerHeight: number;
  private buffer: number;
  private total: number;
  private onRangeChange?: (start: number, end: number) => void;

  private scrollTop: number = 0;
  private visibleStart: number = 0;
  private visibleEnd: number = 0;

  private renderFunction?: (index: number) => HTMLElement;

  constructor(container: HTMLElement, options: VirtualListOptions) {
    this.container = container;
    this.itemHeight = options.itemHeight;
    this.containerHeight = options.containerHeight;
    this.buffer = options.buffer ?? 5;
    this.total = options.total;
    this.onRangeChange = options.onRangeChange;

    this.setupContainer();
    this.setupScrollListener();
    this.updateVisibleRange();
  }

  /**
   * Set up the container element
   */
  private setupContainer(): void {
    this.container.style.position = 'relative';
    this.container.style.overflow = 'auto';
    this.container.style.height = `${this.containerHeight}px`;

    // Create a spacer element to maintain scroll height
    const spacer = document.createElement('div');
    spacer.style.height = `${this.total * this.itemHeight}px`;
    spacer.style.position = 'relative';
    this.container.appendChild(spacer);
  }

  /**
   * Set up scroll event listener
   */
  private setupScrollListener(): void {
    this.container.addEventListener('scroll', () => {
      this.scrollTop = this.container.scrollTop;
      this.updateVisibleRange();
    }, { passive: true });
  }

  /**
   * Update the visible range based on scroll position
   */
  private updateVisibleRange(): void {
    const startIndex = Math.floor(this.scrollTop / this.itemHeight);
    const visibleCount = Math.ceil(this.containerHeight / this.itemHeight);

    const start = Math.max(0, startIndex - this.buffer);
    const end = Math.min(this.total, startIndex + visibleCount + this.buffer);

    if (start !== this.visibleStart || end !== this.visibleEnd) {
      this.visibleStart = start;
      this.visibleEnd = end;
      this.render();
      this.onRangeChange?.(start, end);
    }
  }

  /**
   * Set the render function for items
   */
  setRenderFunction(fn: (index: number) => HTMLElement): void {
    this.renderFunction = fn;
    this.render();
  }

  /**
   * Render visible items
   */
  private render(): void {
    if (!this.renderFunction) return;

    // Clear existing items (except spacer)
    const spacer = this.container.lastElementChild;
    while (this.container.firstChild && this.container.firstChild !== spacer) {
      this.container.removeChild(this.container.firstChild);
    }

    // Render visible items
    for (let i = this.visibleStart; i < this.visibleEnd; i++) {
      const item = this.renderFunction(i);
      item.style.position = 'absolute';
      item.style.top = `${i * this.itemHeight}px`;
      item.style.width = '100%';
      this.container.insertBefore(item, spacer);
    }
  }

  /**
   * Update total item count
   */
  setTotal(total: number): void {
    this.total = total;
    const spacer = this.container.lastElementChild;
    if (spacer) {
      spacer.style.height = `${total * this.itemHeight}px`;
    }
    this.updateVisibleRange();
  }

  /**
   * Scroll to a specific item index
   */
  scrollToIndex(index: number): void {
    this.container.scrollTop = index * this.itemHeight;
  }

  /**
   * Get current visible range
   */
  getVisibleRange(): { start: number; end: number } {
    return { start: this.visibleStart, end: this.visibleEnd };
  }

  /**
   * Destroy the virtual list
   */
  destroy(): void {
    this.container.innerHTML = '';
  }
}

/**
 * Create a virtual list from a template element
 */
export function createVirtualList(
  containerId: string,
  options: VirtualListOptions
): VirtualList | null {
  const container = document.getElementById(containerId);
  if (!container) return null;
  return new VirtualList(container, options);
}

// Export to global scope for mini-program usage
if (typeof window !== 'undefined') {
  (window as any).__dualler_virtual_list__ = {
    create: createVirtualList,
    VirtualList
  };
}
