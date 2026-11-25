(() => {
  const calculator = document.querySelector('[data-rad-fahrzeit]');
  if (!calculator) return;
  const distance = calculator.querySelector('[name="strecke"]');
  const speed = calculator.querySelector('[name="tempo"]');
  const result = calculator.querySelector('output');
  const format = new Intl.NumberFormat('de-DE', {maximumFractionDigits: 1});
  function updateTravelTime() {
    const seconds = 3.6 * distance.valueAsNumber / speed.valueAsNumber;
    const valid = distance.valueAsNumber > 0 && speed.valueAsNumber > 0 && Number.isFinite(seconds);
    result.textContent = valid ? 'Bei gleichmäßigem Tempo dauert die Fahrt ' + format.format(seconds) + ' Sekunden.' : 'Bitte zwei positive Zahlen eingeben.';
  }
  calculator.addEventListener('input', updateTravelTime);
  updateTravelTime();
  calculator.hidden = false;
})();
