export class InfiniteScrollSentinel {
  constructor(options = {}) {
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
    this.sentinel = document.createElement('div');
    this.sentinel.style.height = '1px';
    this.sentinel.style.marginTop = '40px';
    this.sentinel.style.backgroundColor = 'red'; // Make it visible for debugging
    this.sentinel.style.position = 'relative';
    this.sentinel.style.zIndex = '1000';
    return this.sentinel;
  }

  setupObserver(container, onLoadMore) {
    if (!this.sentinel) {
      this.sentinel = this.createSentinel();

      if (container) {
        container.appendChild(this.sentinel);
      } else {
        console.error('❌ No container to append sentinel to');
        return;
      }
    }

    this.loadMoreCallback = onLoadMore;

    if (this.observer) {
      this.observer.disconnect();
    }

    this.observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting && !this.isLoading && this.loadMoreCallback) {
        this.isLoading = true;
        Promise.resolve(this.loadMoreCallback()).finally(() => {
          this.isLoading = false;
        });
      }
    }, this.options);

    this.observer.observe(this.sentinel);
  }

  disconnect() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }

    if (this.sentinel && this.sentinel.parentNode) {
      this.sentinel.parentNode.removeChild(this.sentinel);
      this.sentinel = null;
    }
  }
}
