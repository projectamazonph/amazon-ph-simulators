const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

function read(path) {
  return fs.readFileSync(path, 'utf8');
}

test('SQP Studio is slotted into the hub and shared simulator navigation', () => {
  const index = read('index.html');
  const planned = read('planned-simulators.html');
  const shell = read('assets/shell.js');

  assert.match(index, /href="sqp-studio\.html"/);
  assert.match(index, /S10 SQP Studio/);
  assert.match(planned, /href="sqp-studio\.html"/);
  assert.match(planned, /<span>Online<\/span><span class="ver">v1\.0<\/span><span class="cat">Analytics<\/span>/);
  assert.match(shell, /id: 'sqp-studio'/);
  assert.match(shell, /file: 'sqp-studio\.html'/);
});

test('Bid Decisions is slotted into the hub and shared simulator navigation', () => {
  const index = read('index.html');
  const planned = read('planned-simulators.html');
  const shell = read('assets/shell.js');

  assert.match(index, /href="bid-decisions\.html"/);
  assert.match(index, /S2 Bid Decisions/);
  assert.match(planned, /href="bid-decisions\.html"/);
  assert.match(planned, /<span>Online<\/span><span class="ver">v1\.0<\/span><span class="cat">Bids<\/span>/);
  assert.match(shell, /id: 'bid-decisions'/);
  assert.match(shell, /file: 'bid-decisions\.html'/);
});
