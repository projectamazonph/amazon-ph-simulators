const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const modules = ['m0', 'm1', 'm2', 'm3', 'm4', 'm5', 'm6', 'm7', 'm8', 'm9', 'm10', 'm11']
  .map(moduleId => [moduleId, 12]);

function read(file) {
  return fs.readFileSync(file, 'utf8');
}

test('public teaching viewer registers one final deck for every curriculum module', () => {
  const manifest = read('coach-decks/module-decks.js');
  const viewer = read('coach-decks.html');
  const coachTools = read('coach-tools.html');

  assert.match(viewer, /coach-decks\/module-decks\.js/);
  assert.match(viewer, /\?module=\$\{deckId\}/);
  modules.forEach(([moduleId]) => {
    assert.match(manifest, new RegExp(`"id": "${moduleId}"`));
    assert.match(coachTools, new RegExp(`href="coach-decks\\.html\\?module=${moduleId}"`));
  });
});

test('every final module deck has its expected slide sequence and permanent local assets', () => {
  modules.forEach(([moduleId, slideCount]) => {
    const folder = path.join('coach-decks', 'modules', moduleId);
    const slides = fs.readdirSync(folder).filter(file => /^slide_\d+\.html$/.test(file));
    assert.equal(slides.length, slideCount, `${moduleId} slide count`);
    for (let index = 1; index <= slideCount; index += 1) {
      const slide = read(path.join(folder, `slide_${index}.html`));
      assert.doesNotMatch(slide, /private-us-east-1\.manuscdn\.com/);
      assert.match(slide, /slide-container/);
      assert.match(slide, /(?:@keyframes|animation:|transition:)/, `${moduleId} slide ${index} has motion treatment`);
    }
  });
});
