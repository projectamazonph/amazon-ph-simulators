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

test('every final module deck keeps the beginner-first teaching structure', () => {
  modules.forEach(([moduleId, slideCount]) => {
    for (let index = 1; index <= slideCount; index += 1) {
      const slide = read(path.join('coach-decks', 'modules', moduleId, `slide_${index}.html`));
      const text = slide
        .replace(/<style[\s\S]*?<\/style>/gi, ' ')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      const words = text.match(/\b[\w'-]+\b/g) || [];

      assert.match(slide, /Word to know/, `${moduleId} slide ${index} has a defined term`);
      assert.match(slide, /Plain meaning/, `${moduleId} slide ${index} has a plain-language explanation`);
      assert.match(slide, /Small example/, `${moduleId} slide ${index} has a concrete example`);
      assert.match(slide, /Your next step:/, `${moduleId} slide ${index} gives a clear learner action`);
      assert.match(slide, /prefers-reduced-motion:reduce/, `${moduleId} slide ${index} supports reduced motion`);
      assert.ok(words.length <= 115, `${moduleId} slide ${index} keeps learner copy short`);
    }
  });
});
