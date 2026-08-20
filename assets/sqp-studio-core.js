(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.SQPStudioCore = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var DIAGNOSES = {
    scale_visibility: {
      label: 'Scale visibility',
      shortLabel: 'Scale',
      description: 'Conversion is strong, but brand impression share is still low.'
    },
    fix_listing_conversion: {
      label: 'Fix listing conversion',
      shortLabel: 'Fix PDP',
      description: 'Traffic exists, but the query is leaking shoppers before purchase.'
    },
    watch_data_limit: {
      label: 'Watch data limit',
      shortLabel: 'Watch',
      description: 'The signal is too thin to prove a confident action yet.'
    },
    reduce_waste: {
      label: 'Reduce waste',
      shortLabel: 'Tighten',
      description: 'Visibility exists, but purchase share does not justify current exposure.'
    }
  };

  var FOLLOW_UPS = {
    increase_coverage: {
      label: 'Expand campaign coverage',
      description: 'Increase exact/phrase coverage and check placement or budget limits.'
    },
    audit_pdp: {
      label: 'Audit PDP and offer',
      description: 'Review main image, price, coupon, reviews, and title/query fit.'
    },
    collect_more_data: {
      label: 'Collect more data',
      description: 'Wait for more impressions/clicks before changing bids or structure.'
    },
    tighten_targeting: {
      label: 'Tighten targeting',
      description: 'Reduce weak exposure with bid cuts, negatives, or cleaner match types.'
    }
  };

  var SQP_STUDIO_SCENARIO = {
    id: 'sqp-studio',
    version: '1.0.0',
    rubricVersion: '1.0.0',
    title: 'SQP Studio',
    passingScore: 75,
    diagnoses: DIAGNOSES,
    followUps: FOLLOW_UPS,
    queries: [
      {
        id: 'stainless-lunch-box',
        query: 'stainless lunch box',
        queryVolume: 12000,
        marketPurchases: 420,
        brandImpressions: 960,
        brandClicks: 110,
        brandCartAdds: 28,
        brandPurchases: 18,
        expectedDiagnosis: 'scale_visibility',
        expectedFollowUp: 'increase_coverage',
        evidence: 'Your purchase rate is far above the market rate while impression share is only 8%. Visibility is the constraint, not conversion.',
        feedback: 'Visibility is the constraint: this query converts well when shoppers reach you, so the next move is controlled coverage expansion.'
      },
      {
        id: 'kids-bento-box-leakproof',
        query: 'kids bento box leakproof',
        queryVolume: 9800,
        marketPurchases: 360,
        brandImpressions: 1764,
        brandClicks: 190,
        brandCartAdds: 24,
        brandPurchases: 5,
        expectedDiagnosis: 'fix_listing_conversion',
        expectedFollowUp: 'audit_pdp',
        evidence: 'Brand visibility and clicks are present, but only 5 purchases from 190 clicks points to PDP or offer friction.',
        feedback: 'Traffic is not the biggest gap here. Diagnose the listing, offer, reviews, image, and query fit before scaling.'
      },
      {
        id: 'insulated-food-jar',
        query: 'insulated food jar',
        queryVolume: 6400,
        marketPurchases: 210,
        brandImpressions: 128,
        brandClicks: 7,
        brandCartAdds: 1,
        brandPurchases: 1,
        expectedDiagnosis: 'watch_data_limit',
        expectedFollowUp: 'collect_more_data',
        evidence: 'The row has only 7 clicks and 1 purchase. That can hint, but it cannot prove a confident optimization.',
        feedback: 'There is not enough brand-side data yet. Keep the query on watch and collect more clicks before making a structural move.'
      },
      {
        id: 'bento-accessories',
        query: 'bento accessories',
        queryVolume: 8500,
        marketPurchases: 260,
        brandImpressions: 1445,
        brandClicks: 82,
        brandCartAdds: 6,
        brandPurchases: 1,
        expectedDiagnosis: 'reduce_waste',
        expectedFollowUp: 'tighten_targeting',
        evidence: 'The query is getting exposure, but purchase share and purchase rate are weak against the market.',
        feedback: 'This is weak exposure. Tighten targeting or reduce bids until the query proves it can convert profitably.'
      }
    ]
  };

  function percent(numerator, denominator) {
    if (!denominator) return 0;
    return Math.round((numerator / denominator) * 10000) / 100;
  }

  function calculateQueryMetrics(row) {
    return {
      impressionShare: percent(row.brandImpressions, row.queryVolume),
      clickThroughRate: percent(row.brandClicks, row.brandImpressions),
      cartAddRate: percent(row.brandCartAdds, row.brandClicks),
      purchaseRate: percent(row.brandPurchases, row.brandClicks),
      purchaseShare: percent(row.brandPurchases, row.marketPurchases),
      marketPurchaseRate: percent(row.marketPurchases, row.queryVolume)
    };
  }

  function gradeQuery(query, answer) {
    var safeAnswer = answer || {};
    var diagnosisCorrect = safeAnswer.diagnosis === query.expectedDiagnosis;
    var followUpCorrect = safeAnswer.followUp === query.expectedFollowUp;
    var earned = 0;

    if (diagnosisCorrect) earned += 15;
    if (followUpCorrect) earned += 10;

    return {
      queryId: query.id,
      query: query.query,
      earned: earned,
      possible: 25,
      diagnosisCorrect: diagnosisCorrect,
      followUpCorrect: followUpCorrect,
      expectedDiagnosis: query.expectedDiagnosis,
      expectedFollowUp: query.expectedFollowUp,
      selectedDiagnosis: safeAnswer.diagnosis || '',
      selectedFollowUp: safeAnswer.followUp || '',
      metrics: calculateQueryMetrics(query),
      evidence: query.evidence,
      feedback: query.feedback
    };
  }

  function summarize(score, passingScore) {
    if (score >= 90) {
      return 'Strong SQP read. You separated visibility, conversion, and data-confidence problems cleanly.';
    }
    if (score >= passingScore) {
      return 'Good SQP read. Review the missed rows and tighten the evidence behind each recommendation.';
    }
    return 'Keep practicing the SQP read. Focus on whether the row proves a visibility gap, a conversion gap, a weak-data gap, or wasted exposure.';
  }

  function gradeAttempt(scenario, attempt) {
    var activeScenario = scenario || SQP_STUDIO_SCENARIO;
    var safeAttempt = attempt || {};
    var items = activeScenario.queries.map(function (query) {
      return gradeQuery(query, safeAttempt[query.id]);
    });
    var score = items.reduce(function (sum, item) {
      return sum + item.earned;
    }, 0);
    var maxScore = items.reduce(function (sum, item) {
      return sum + item.possible;
    }, 0);
    var correctDecisions = items.filter(function (item) {
      return item.diagnosisCorrect && item.followUpCorrect;
    }).length;
    var passingScore = activeScenario.passingScore || 75;

    return {
      score: score,
      maxScore: maxScore,
      correctDecisions: correctDecisions,
      totalDecisions: items.length,
      passed: score >= passingScore,
      summary: summarize(score, passingScore),
      items: items
    };
  }

  return {
    SQP_STUDIO_SCENARIO: SQP_STUDIO_SCENARIO,
    DIAGNOSES: DIAGNOSES,
    FOLLOW_UPS: FOLLOW_UPS,
    calculateQueryMetrics: calculateQueryMetrics,
    gradeAttempt: gradeAttempt
  };
});
