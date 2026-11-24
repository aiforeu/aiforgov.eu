const slots = [...document.querySelectorAll('[data-product-scene]')];
if (slots.length && 'IntersectionObserver' in window && !navigator.connection?.saveData) {
  const near = new IntersectionObserver(entries => {
    if (!entries.some(entry => entry.isIntersecting)) return;
    near.disconnect();
    import('./mount.js').then(({ mount }) => mount(slots)).catch(() => {
      // The HTML already shows the same models rendered onto transparent backgrounds.
    });
  }, { rootMargin: '180px 0px' });
  near.observe(slots[0].closest('.ap-overview'));
}
