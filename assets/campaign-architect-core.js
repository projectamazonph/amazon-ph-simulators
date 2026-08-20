(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('./decision-simulator-core.js'));
  } else {
    root.CampaignArchitectCore = factory(root.DecisionSimulatorCore);
  }
})(typeof self !== 'undefined' ? self : this, function (DecisionSimulatorCore) {
  'use strict';

  var PRIMARY_OPTIONS = {
    separate_auto_manual: 'Separate auto discovery and manual control',
    exact_phrase_core: 'Build exact and phrase core targets',
    seed_negatives: 'Seed obvious negatives before launch',
    review_after_7_days: 'Review after 7 days or enough clicks',
    ask_for_brief: 'Ask for a better product brief'
  };

  var SECONDARY_OPTIONS = {
    low: 'Low risk',
    medium: 'Medium risk',
    high: 'High risk'
  };

  var CAMPAIGN_ARCHITECT_SCENARIO = {
    id: 'campaign-architect',
    version: '1.0.0',
    rubricVersion: '1.0.0',
    title: 'Campaign Architect',
    kicker: 'Planning simulator',
    description: 'Turn a product brief into launch structure, targeting, negatives, and first review rules.',
    passingScore: 75,
    primaryLabel: 'Architecture decision',
    secondaryLabel: 'Risk level',
    primaryOptions: PRIMARY_OPTIONS,
    secondaryOptions: SECONDARY_OPTIONS,
    summary: {
      excellent: 'Strong campaign architecture. Your structure separates discovery from control and protects launch spend.',
      passing: 'Good campaign plan. Review missed rows to tighten risk and review timing.',
      needsPractice: 'Keep practicing campaign architecture. Anchor each build choice to goal, control, and evidence quality.'
    },
    rows: [
      {
        id: 'launch-structure',
        title: 'Lunch container launch',
        signal: 'New ASIN, no ad history, target ACOS 35%, client wants discovery without losing budget control.',
        metrics: { budget: '$45/day', goal: 'Discovery + first sales', catalog: '1 hero ASIN' },
        expectedPrimary: 'separate_auto_manual',
        expectedSecondary: 'medium',
        evidence: 'Auto can discover search terms while manual campaigns keep the first proven targets controllable.',
        feedback: 'Split auto discovery from manual control. A single mixed campaign makes budget, query, and bid decisions harder to read.'
      },
      {
        id: 'core-targeting',
        title: 'Known buyer phrases',
        signal: 'Brief includes four high-intent phrases from listing copy and competitor research.',
        metrics: { terms: '4 core phrases', intent: 'High', match: 'Exact/Phrase' },
        expectedPrimary: 'exact_phrase_core',
        expectedSecondary: 'low',
        evidence: 'Known high-intent phrases deserve manual exact and phrase coverage at launch.',
        feedback: 'Put the known buyer language into exact and phrase campaigns so the VA can read and optimize it directly.'
      },
      {
        id: 'prelaunch-negatives',
        title: 'Bad-fit query guardrails',
        signal: 'Product is stainless steel, but research repeatedly shows plastic, disposable, and party favor queries.',
        metrics: { badFit: '3 themes', relevance: 'Low', spendRisk: 'Early waste' },
        expectedPrimary: 'seed_negatives',
        expectedSecondary: 'low',
        evidence: 'Known bad-fit themes can be excluded before they burn discovery budget.',
        feedback: 'Seed obvious negatives before launch. Guardrails are not over-optimization when the mismatch is already known.'
      },
      {
        id: 'first-review-rule',
        title: 'First optimization window',
        signal: 'Client asks for changes after day one, but expected traffic is only 15-25 clicks per day.',
        metrics: { clicks: '15-25/day', review: 'Day 7', confidence: 'Enough trend' },
        expectedPrimary: 'review_after_7_days',
        expectedSecondary: 'medium',
        evidence: 'A seven-day or sufficient-click review prevents day-one noise from driving campaign structure changes.',
        feedback: 'Set the first review window in advance. Daily checks are fine, but structural decisions need enough traffic to mean something.'
      }
    ]
  };

  var simulator = DecisionSimulatorCore.createDecisionSimulator(CAMPAIGN_ARCHITECT_SCENARIO);

  return {
    CAMPAIGN_ARCHITECT_SCENARIO: CAMPAIGN_ARCHITECT_SCENARIO,
    PRIMARY_OPTIONS: PRIMARY_OPTIONS,
    SECONDARY_OPTIONS: SECONDARY_OPTIONS,
    gradeAttempt: simulator.gradeAttempt
  };
});
