(function () {
  'use strict';

  if (!window.CurriculumManifest || !window.StudentProgress || !window.ProgressPresentation) return;

  var store = StudentProgress.createLocalProgressStore();
  var toneColors = {
    neutral: ['#eef2f7', '#526071'],
    warning: ['#fff4d6', '#8a5a00'],
    success: ['#dcfce7', '#166534']
  };

  document.querySelectorAll('#simulator-library a.pha-tcard[href]').forEach(function (card) {
    var file = card.getAttribute('href');
    var simulator = CurriculumManifest.SIMULATORS.find(function (item) { return item.file === file; });
    if (!simulator) return;

    var view = ProgressPresentation.describe(store.getSimulatorProgress(simulator.id));
    var colors = toneColors[view.tone];
    var badge = document.createElement('div');
    badge.className = 'pha-progress-badge';
    badge.setAttribute('data-progress-status', view.tone);
    badge.style.cssText = 'margin-top:12px;padding:8px 10px;border-radius:8px;background:' + colors[0] + ';color:' + colors[1] + ';font-size:11px;font-weight:700;display:flex;justify-content:space-between;gap:8px';
    badge.innerHTML = '<span>' + view.label + '</span><span>' + view.detail + '</span>';
    card.insertBefore(badge, card.querySelector('.pha-tcard-foot'));
  });
})();
