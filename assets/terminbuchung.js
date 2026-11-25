(() => {
  'use strict';
  const section = document.querySelector('[data-terminbuchung]');
  if (!section) return;
  const open = section.querySelector('[data-terminwahl]');
  const alternate = section.querySelector('[data-buchungslink]');
  const actions = section.querySelector('[data-buchungsaktionen]') || alternate;
  const retry = section.querySelector('[data-buchung-neuladen]');
  const stage = section.querySelector('.contact-booking-stage');
  const status = section.querySelector('.contact-booking-loading');
  let frame = section.querySelector('iframe');

  function setLanguage() {
    const language = document.documentElement.lang || 'de';
    const url = new URL(open.href);
    url.searchParams.set('lang', language);
    url.searchParams.set('hl', language);
    open.href = url.href;
    alternate.href = url.href;
    return url;
  }

  function loadFrame(url, focus) {
    // Each navigation owns its load event, including a retry of the same URL.
    const current = frame.cloneNode(false);
    current.setAttribute('aria-busy', 'true');
    current.addEventListener('load', () => {
      if (current !== frame) return;
      current.removeAttribute('aria-busy');
      if (status) status.hidden = true;
    }, { once: true });
    current.src = url.href;
    current.hidden = false;
    if (stage) stage.hidden = false;
    if (status) status.hidden = false;
    const previous = frame;
    frame = current;
    previous.replaceWith(current);
    if (focus) current.focus();
  }

  open.addEventListener('click', event => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    actions.hidden = false;
    open.hidden = true;
    loadFrame(setLanguage(), true);
  });
  retry?.addEventListener('click', () => {
    loadFrame(setLanguage(), true);
  });
  window.addEventListener('aiforeu:language-ready', () => {
    const url = setLanguage();
    if (!frame.hidden && frame.src !== url.href) loadFrame(url, false);
  });
  setLanguage();
})();
