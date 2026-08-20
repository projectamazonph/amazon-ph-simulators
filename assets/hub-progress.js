(function () {
  'use strict';

  if (!window.CurriculumManifest || !window.StudentProgress || !window.ProgressPresentation) return;

  var store = StudentProgress.createLocalProgressStore();
  document.querySelectorAll('#simulator-library a.pha-tcard[href]').forEach(function (card) {
    var file = card.getAttribute('href');
    var simulator = CurriculumManifest.SIMULATORS.find(function (item) { return item.file === file; });
    if (!simulator) return;

    var view = ProgressPresentation.describe(store.getSimulatorProgress(simulator.id));
    var badge = document.createElement('div');
    badge.className = 'pha-progress-badge';
    badge.setAttribute('data-progress-status', view.tone);
    badge.innerHTML = '<span class="pha-progress-label">' + view.label + '</span><span class="pha-progress-detail">' + view.detail + '</span>';
    card.insertBefore(badge, card.querySelector('.pha-tcard-foot'));
  });
})();
