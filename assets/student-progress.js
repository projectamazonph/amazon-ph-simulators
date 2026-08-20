(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.StudentProgress = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var DEFAULT_KEY = 'aph-student-progress-v1';

  function emptyState() {
    return { version: 1, attempts: [] };
  }

  function readState(storage, storageKey) {
    try {
      var parsed = JSON.parse(storage.getItem(storageKey) || 'null');
      if (parsed && parsed.version === 1 && Array.isArray(parsed.attempts)) {
        return parsed;
      }
    } catch (error) {
      return emptyState();
    }
    return emptyState();
  }

  function requireValue(attempt, field) {
    if (attempt[field] === undefined || attempt[field] === null || attempt[field] === '') {
      throw new TypeError(field + ' is required');
    }
  }

  function validateAttempt(attempt) {
    requireValue(attempt, 'simulatorId');
    requireValue(attempt, 'scenarioVersion');
    requireValue(attempt, 'rubricVersion');
    requireValue(attempt, 'score');
    requireValue(attempt, 'completedAt');

    if (typeof attempt.score !== 'number' || attempt.score < 0 || attempt.score > 100) {
      throw new TypeError('score must be a number from 0 to 100');
    }
    if (typeof attempt.passed !== 'boolean') {
      throw new TypeError('passed must be a boolean');
    }
  }

  function copyAttempt(attempt) {
    var copied = {
      simulatorId: attempt.simulatorId,
      scenarioVersion: attempt.scenarioVersion,
      rubricVersion: attempt.rubricVersion,
      score: attempt.score,
      passed: attempt.passed,
      completedAt: attempt.completedAt
    };
    if (attempt.scenarioId) copied.scenarioId = attempt.scenarioId;
    return copied;
  }

  function createProgressStore(storage, storageKey) {
    if (!storage || typeof storage.getItem !== 'function' || typeof storage.setItem !== 'function') {
      throw new TypeError('A storage adapter with getItem and setItem is required');
    }

    var key = storageKey || DEFAULT_KEY;

    function writeState(state) {
      storage.setItem(key, JSON.stringify(state));
    }

    function recordAttempt(attempt) {
      var safeAttempt = attempt || {};
      validateAttempt(safeAttempt);
      var state = readState(storage, key);
      var storedAttempt = copyAttempt(safeAttempt);
      state.attempts.push(storedAttempt);
      writeState(state);
      return storedAttempt;
    }

    function getSimulatorProgress(simulatorId) {
      var attempts = readState(storage, key).attempts.filter(function (attempt) {
        return attempt.simulatorId === simulatorId;
      });
      var bestScore = attempts.reduce(function (best, attempt) {
        return Math.max(best, attempt.score);
      }, 0);
      var passed = attempts.some(function (attempt) { return attempt.passed; });

      return {
        simulatorId: simulatorId,
        status: attempts.length === 0 ? 'not_started' : (passed ? 'passed' : 'in_progress'),
        bestScore: bestScore,
        attemptCount: attempts.length,
        latestAttempt: attempts.length ? copyAttempt(attempts[attempts.length - 1]) : null
      };
    }

    return {
      recordAttempt: recordAttempt,
      getSimulatorProgress: getSimulatorProgress
    };
  }

  return {
    DEFAULT_KEY: DEFAULT_KEY,
    createProgressStore: createProgressStore,
    createLocalProgressStore: function () {
      return createProgressStore(localStorage, DEFAULT_KEY);
    }
  };
});
