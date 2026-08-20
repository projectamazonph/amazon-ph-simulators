(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('./decision-simulator-core.js'));
  } else {
    root.CapstoneSequenceCore = factory(root.DecisionSimulatorCore);
  }
})(typeof self !== 'undefined' ? self : this, function (DecisionSimulatorCore) {
  'use strict';

  var PRIMARY_OPTIONS = {
    choose_relevant_keywords: 'Choose relevant buyer keywords',
    build_clean_structure: 'Build clean campaign structure',
    reduce_waste_harvest_winners: 'Reduce waste and harvest winners',
    send_evidence_summary: 'Send evidence-based client summary',
    skip_to_scaling: 'Skip directly to scaling'
  };

  var SECONDARY_OPTIONS = {
    research: 'Research stage',
    setup: 'Setup stage',
    optimize: 'Optimization stage',
    report: 'Reporting stage'
  };

  var CAPSTONE_SEQUENCE_SCENARIO = {
    id: 'capstone-sequence',
    version: '1.0.0',
    rubricVersion: '1.0.0',
    title: 'Capstone Sequence',
    kicker: 'Capstone simulator',
    description: 'Make the correct stage decision across research, setup, optimization, and client reporting.',
    passingScore: 75,
    primaryLabel: 'Capstone decision',
    secondaryLabel: 'Stage',
    primaryOptions: PRIMARY_OPTIONS,
    secondaryOptions: SECONDARY_OPTIONS,
    summary: {
      excellent: 'Strong capstone sequence. You kept the work in order from research through client communication.',
      passing: 'Good capstone judgment. Review missed rows and keep each action tied to the correct stage.',
      needsPractice: 'Keep practicing the sequence. Capstone quality comes from doing the right work at the right moment.'
    },
    rows: [
      {
        id: 'research-stage',
        title: 'Before campaign setup',
        signal: 'The brief names the product and audience, but there is no keyword shortlist or bad-fit query list yet.',
        metrics: { phase: 'Pre-build', inputs: 'Brief only', gap: 'Keyword map' },
        expectedPrimary: 'choose_relevant_keywords',
        expectedSecondary: 'research',
        evidence: 'Campaign setup should follow a relevant keyword and negative seed list.',
        feedback: 'Start with relevant buyer keywords and exclusions. The capstone should not jump into campaign setup without research inputs.'
      },
      {
        id: 'setup-stage',
        title: 'Ready to launch',
        signal: 'The keyword map is approved. The VA must translate it into campaigns that can be read and optimized.',
        metrics: { phase: 'Build', inputs: 'Approved map', goal: 'Readable launch' },
        expectedPrimary: 'build_clean_structure',
        expectedSecondary: 'setup',
        evidence: 'A clean structure makes later performance decisions easier to defend.',
        feedback: 'Build clean campaign structure before optimization. Separate discovery and control so future reads are meaningful.'
      },
      {
        id: 'optimization-stage',
        title: 'Seven-day performance read',
        signal: 'The account has winners, expensive non-converters, and search terms ready for harvesting.',
        metrics: { phase: 'Week 1 read', winners: '2', waste: '$64' },
        expectedPrimary: 'reduce_waste_harvest_winners',
        expectedSecondary: 'optimize',
        evidence: 'Once data exists, the right move is to protect spend and move proven queries into controllable places.',
        feedback: 'Optimization is the stage for cutting waste and harvesting winners. Do not scale before controlling the obvious leaks.'
      },
      {
        id: 'reporting-stage',
        title: 'Client update due',
        signal: 'The VA has made changes and needs to explain what changed, why, and what happens next.',
        metrics: { phase: 'Report', audience: 'Client', need: 'Evidence' },
        expectedPrimary: 'send_evidence_summary',
        expectedSecondary: 'report',
        evidence: 'A capstone finish requires client communication that ties actions to evidence and next checks.',
        feedback: 'Send an evidence-based summary. Capstone work is incomplete until the client can understand the decisions and risks.'
      }
    ]
  };

  var simulator = DecisionSimulatorCore.createDecisionSimulator(CAPSTONE_SEQUENCE_SCENARIO);

  return {
    CAPSTONE_SEQUENCE_SCENARIO: CAPSTONE_SEQUENCE_SCENARIO,
    PRIMARY_OPTIONS: PRIMARY_OPTIONS,
    SECONDARY_OPTIONS: SECONDARY_OPTIONS,
    gradeAttempt: simulator.gradeAttempt
  };
});
