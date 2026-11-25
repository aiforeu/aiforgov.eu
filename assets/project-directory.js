// Keep existing project links shareable while the browser handles the disclosures.
(() => {
  const list = document.querySelector('.project-directory-list');
  if (!list) return;

  function followFragment() {
    const target = document.getElementById(location.hash.slice(1));
    const record = target?.closest('.project-record');
    if (record) {
      record.open = true;
      record.scrollIntoView({ block: 'start', behavior: 'instant' });
    } else if (!location.hash) {
      list.querySelector('.project-record[open]')?.removeAttribute('open');
    }
  }

  list.addEventListener('click', event => {
    const summary = event.target.closest('summary');
    if (!summary) return;
    // Read the state after the native click or keyboard activation has finished.
    requestAnimationFrame(() => {
      const record = summary.parentElement;
      const url = new URL(location.href);
      url.hash = record.open ? record.querySelector('.project-record-body').id : '';
      if (url.href !== location.href) history.pushState(history.state, '', url);

      const box = summary.getBoundingClientRect();
      const inset = parseFloat(getComputedStyle(record).scrollMarginBlockStart) || 0;
      if (box.top < inset || (record.open && box.bottom > innerHeight - 100)) {
        record.scrollIntoView({ block: 'start', behavior: 'instant' });
      }
    });
  });

  addEventListener('hashchange', followFragment);
  if (location.hash) followFragment();
})();
