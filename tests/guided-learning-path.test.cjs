const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

function read(file) {
  return fs.readFileSync(file, 'utf8');
}

test('hub presents PPC Coach as the guided starting point before the simulator library', () => {
  const hub = read('index.html');
  const learningStart = hub.indexOf('id="learning-start"');
  const simulatorLibrary = hub.indexOf('id="simulator-library"');

  assert.ok(learningStart >= 0, 'hub must include the guided learning start');
  assert.ok(simulatorLibrary > learningStart, 'guided learning must appear before simulators');
  assert.match(hub, /<a class="pha-tcard[^"]*pha-tcard--ppc-coach[^"]*" href="ppc-coach\.html">/);
  assert.match(hub, />Start PPC Coach<\/span>/);
  assert.match(hub, /href="learn\/guide\.html"/);
});

test('Coach module pages render simulator assignments from the curriculum manifest', () => {
  const coach = read('ppc-coach.html');

  assert.match(coach, /src="assets\/curriculum-manifest\.js"/);
  assert.match(coach, /src="assets\/student-progress\.js"/);
  assert.match(coach, /src="assets\/progress-presentation\.js"/);
  assert.match(coach, /function renderModulePractice\(moduleId\)/);
  assert.match(coach, /CurriculumManifest\.getModule\(moduleId\)/);
  assert.match(coach, /practiceProgressStore\.getSimulatorProgress\(a\.simulatorId\)/);
  assert.match(coach, /ProgressPresentation\.describe\(progress\)/);
  assert.match(coach, /renderModulePractice\("m"\+i\)/);
});

test('hub annotates simulator cards from shared student progress', () => {
  const hub = read('index.html');

  assert.match(hub, /src="assets\/curriculum-manifest\.js"/);
  assert.match(hub, /src="assets\/student-progress\.js"/);
  assert.match(hub, /src="assets\/progress-presentation\.js"/);
  assert.match(hub, /src="assets\/hub-progress\.js"/);
});

test('student guide assigns Listing Readiness and its simulator practice', () => {
  const guide = read('learn/guide.html');

  assert.match(guide, /Module 5 \(Listing Readiness\)/);
  assert.match(guide, /href="\.\.\/listing\.html"/);
});
