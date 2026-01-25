export class AnimationObserver {
  constructor(options = {}) {
    this.options = {
      threshold: 0.1,
      rootMargin: '100px 0px',
      ...options,
    };

    this.observer = null;
    this.scrollDirection = 'down';
    this.lastScrollY = 0;
    this.callbacks = new Map();
    this.hasUserScrolled = false; // NEW: Track if user has scrolled

    this.initScrollHandler();
  }

  initScrollHandler() {
    window.addEventListener(
      'scroll',
      () => {
        const currentScrollY = window.scrollY;
        this.scrollDirection = currentScrollY > this.lastScrollY ? 'down' : 'up';
        this.lastScrollY = currentScrollY;
        this.hasUserScrolled = true; // NEW: Set to true on first scroll
      },
      { passive: true }
    );
  }

  createObserver() {
    this.observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        const id = entry.target.dataset.imageId;
        const callback = this.callbacks.get(id);

        if (entry.isIntersecting) {
          // Only trigger onEnter if user has scrolled down
          if (
            this.scrollDirection === 'down' &&
            this.hasUserScrolled &&
            callback?.onEnter
          ) {
            callback.onEnter(id);
          }
          // NEW: If at top of page and hasn't scrolled, don't animate
          else if (!this.hasUserScrolled && window.scrollY === 0) {
            // Don't trigger animation
          }
        } else {
          if (this.scrollDirection === 'up' && callback?.onExit) {
            callback.onExit(id);
          }
        }
      });
    }, this.options);
  }

  observe(element, callbacks) {
    if (!this.observer) {
      this.createObserver();
    }

    const id = element.dataset.imageId;
    if (id) {
      this.callbacks.set(id, callbacks);
      this.observer.observe(element);
    }
  }

  unobserve(element) {
    if (!this.observer) return;

    const id = element.dataset.imageId;
    if (id) {
      this.callbacks.delete(id);
      this.observer.unobserve(element);
    }
  }

  disconnect() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    this.callbacks.clear();
  }
}
