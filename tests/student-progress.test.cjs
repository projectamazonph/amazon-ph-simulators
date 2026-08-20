const test = require('node:test');
const assert = require('node:assert/strict');

const StudentProgress = require('../assets/student-progress.js');

function createMemoryStorage(initialValue) {
  const values = new Map();
  if (initialValue !== undefined) values.set('test-progress', initialValue);
  return {
    getItem(key) { return values.has(key) ? values.get(key) : null; },
    setItem(key, value) { values.set(key, value); },
    removeItem(key) { values.delete(key); }
  };
}

test('progress store keeps attempt history and returns the best simulator result', () => {
  const store = StudentProgress.createProgressStore(createMemoryStorage(), 'test-progress');

  store.recordAttempt({
    simulatorId: 'bid-decisions',
    scenarioVersion: '1.0.0',
    rubricVersion: '1.0.0',
    score: 65,
    passed: false,
    completedAt: '2026-08-20T10:00:00.000Z'
  });
  store.recordAttempt({
    simulatorId: 'bid-decisions',
    scenarioVersion: '1.0.0',
    rubricVersion: '1.0.0',
    score: 90,
    passed: true,
    completedAt: '2026-08-20T11:00:00.000Z'
  });

  assert.deepEqual(store.getSimulatorProgress('bid-decisions'), {
    simulatorId: 'bid-decisions',
    status: 'passed',
    bestScore: 90,
    attemptCount: 2,
    latestAttempt: {
      simulatorId: 'bid-decisions',
      scenarioVersion: '1.0.0',
      rubricVersion: '1.0.0',
      score: 90,
      passed: true,
      completedAt: '2026-08-20T11:00:00.000Z'
    }
  });
});

test('progress status distinguishes not started and in progress', () => {
  const store = StudentProgress.createProgressStore(createMemoryStorage(), 'test-progress');

  assert.deepEqual(store.getSimulatorProgress('sqp-studio'), {
    simulatorId: 'sqp-studio',
    status: 'not_started',
    bestScore: 0,
    attemptCount: 0,
    latestAttempt: null
  });

  store.recordAttempt({
    simulatorId: 'sqp-studio',
    scenarioVersion: '1.0.0',
    rubricVersion: '1.0.0',
    score: 50,
    passed: false,
    completedAt: '2026-08-20T12:00:00.000Z'
  });

  assert.equal(store.getSimulatorProgress('sqp-studio').status, 'in_progress');
});

test('progress store recovers from invalid persisted data', () => {
  const store = StudentProgress.createProgressStore(
    createMemoryStorage('{not valid json'),
    'test-progress'
  );

  assert.equal(store.getSimulatorProgress('account-audit').status, 'not_started');
});

test('recordAttempt rejects incomplete versioned attempt data', () => {
  const store = StudentProgress.createProgressStore(createMemoryStorage(), 'test-progress');

  assert.throws(
    () => store.recordAttempt({ simulatorId: 'bid-decisions', score: 75, passed: true }),
    /scenarioVersion is required/
  );
});
