export class InfiniteScrollSentinel {
  constructor(options = {}) {
    console.log('🌀 InfiniteScrollSentinel constructor called', options);

    this.options = {
      rootMargin: '300px',
      threshold: 0,
      ...options,
    };

    this.observer = null;
    this.sentinel = null;
    this.loadMoreCallback = null;
    this.isLoading = false;
  }

  createSentinel() {
    console.log('🌀 createSentinel called');
    this.sentinel = document.createElement('div');
    this.sentinel.style.height = '1px';
    this.sentinel.style.marginTop = '40px';
    this.sentinel.style.backgroundColor = 'red'; // Make it visible for debugging
    this.sentinel.style.position = 'relative';
    this.sentinel.style.zIndex = '1000';
    return this.sentinel;
  }

  setupObserver(container, onLoadMore) {
    console.log('🌀 setupObserver called', { container, hasContainer: !!container });

    if (!this.sentinel) {
      console.log('🆕 Creating new sentinel element');
      this.sentinel = this.createSentinel();

      if (container) {
        console.log('📦 Appending sentinel to container');
        container.appendChild(this.sentinel);
        console.log('✅ Sentinel appended:', this.sentinel);
      } else {
        console.error('❌ No container to append sentinel to');
        return;
      }
    }

    this.loadMoreCallback = onLoadMore;
    console.log('✅ Load more callback registered');

    if (this.observer) {
      console.log('🔄 Disconnecting previous observer');
      this.observer.disconnect();
    }

    console.log('👀 Creating new IntersectionObserver with options:', this.options);
    this.observer = new IntersectionObserver(([entry]) => {
      console.log('📊 Sentinel intersection:', {
        isIntersecting: entry?.isIntersecting,
        isLoading: this.isLoading,
        hasCallback: !!this.loadMoreCallback,
      });

      if (entry?.isIntersecting && !this.isLoading && this.loadMoreCallback) {
        console.log('🚀 Triggering load more callback');
        this.isLoading = true;
        Promise.resolve(this.loadMoreCallback()).finally(() => {
          console.log('✅ Load more callback completed');
          this.isLoading = false;
        });
      }
    }, this.options);

    console.log('👁️ Observing sentinel element');
    this.observer.observe(this.sentinel);
  }

  disconnect() {
    console.log('🌀 disconnect called');
    if (this.observer) {
      console.log('🔌 Disconnecting observer');
      this.observer.disconnect();
      this.observer = null;
    }

    if (this.sentinel && this.sentinel.parentNode) {
      console.log('🗑️ Removing sentinel from DOM');
      this.sentinel.parentNode.removeChild(this.sentinel);
      this.sentinel = null;
    }
  }
}
