/*******************************************************
 * detectors.js
 *
 * Pattern detectors for VitaMate AI:
 *  - Burnout
 *  - Depression / depressive risk
 *  - Imposter syndrome
 *  - Procrastination cycle
 *  - Substance concern
 *  - Social anxiety
 *  - Insomnia risk
 *  - Relationship abuse signal
 *  - Financial stress
 *
 * Each detector:
 *   { id, description, detect(input, state, analysis) }
 *
 * Exported API:
 *   - detectors (array of all detectors)
 *   - runPatternDetectorsForInput(input, state) -> { analysis, hits }
 *******************************************************/

"use strict";

import { normalizeInput, tokenize } from "./utils.js";
import conversationData from "../../data/conversationLogic.json";

/* -------------------- Detector Definitions -------------------- */

export const detectors = [];

/** Burnout */
detectors.push({
  id: "burnout",
  description: "Detects exhaustion, drained energy, and work fatigue",
  detect: (input, state, analysis) => {
    const tokens = tokenize(input);
    const burnoutWords = ["burnout", "burned", "drained", "exhausted", "fried"];
    let score = 0;

    for (const t of tokens) {
      if (burnoutWords.includes(t)) score += 2;
      if (t === "tired" || t === "fatigue") score += 1;
    }
    if ((analysis.categoryScores.stress || 0) > 2) score += 1;

    return score > 0
      ? { hit: true, confidence: Math.min(1, score / 5) }
      : { hit: false };
  }
});

/** Depression */
detectors.push({
  id: "depression",
  description: "Detects depressed mood or hopelessness",
  detect: (input, state, analysis) => {
    const tokens = tokenize(input);
    const depWords = ["hopeless", "worthless", "empty", "numb"];
    let score = 0;

    for (const t of tokens) {
      if (depWords.includes(t)) score += 2;
    }
    if ((analysis.categoryScores.sadness || 0) > 2) score += 2;
    if ((analysis.categoryScores.loneliness || 0) > 1) score += 1;

    return score > 0
      ? { hit: true, confidence: Math.min(1, score / 6) }
      : { hit: false };
  }
});

/** Imposter Syndrome */
detectors.push({
  id: "imposter_syndrome",
  description: "Detects imposter syndrome self-doubt phrases",
  detect: (input) => {
    const text = normalizeInput(input);
    const phrases = [
      "imposter",
      "fraud",
      "phony",
      "not good enough",
      "fooling everyone"
    ];
    return phrases.some((p) => text.includes(p))
      ? { hit: true, confidence: 0.7 }
      : { hit: false };
  }
});

/** Procrastination */
detectors.push({
  id: "procrastination_cycle",
  description: "Detects procrastination and avoidance loops",
  detect: (input) => {
    const text = normalizeInput(input);
    const phrases = [
      "keep delaying",
      "procrastinate",
      "can't start",
      "always put off"
    ];
    return phrases.some((p) => text.includes(p))
      ? { hit: true, confidence: 0.6 }
      : { hit: false };
  }
});

/** Substance Concern */
detectors.push({
  id: "substance_concern",
  description: "Detects substance overuse and dependency mentions",
  detect: (input) => {
    const text = normalizeInput(input);
    const substances = [
      "drinking too much",
      "alcohol problem",
      "weed addiction",
      "cocaine",
      "heroin",
      "drug problem"
    ];
    return substances.some((s) => text.includes(s))
      ? { hit: true, confidence: 0.8 }
      : { hit: false };
  }
});

/** Social Anxiety */
detectors.push({
  id: "social_anxiety",
  description: "Detects fear of social interactions",
  detect: (input) => {
    const text = normalizeInput(input);
    if (text.includes("social anxiety")) return { hit: true, confidence: 0.7 };
    if (text.includes("afraid of people") || text.includes("panic in public"))
      return { hit: true, confidence: 0.6 };
    return { hit: false };
  }
});

/** Insomnia Risk */
detectors.push({
  id: "insomnia_risk",
  description: "Detects repeated poor sleep or insomnia mentions",
  detect: (input, state) => {
    const text = normalizeInput(input);
    if (text.includes("can't sleep") || text.includes("insomnia")) {
      return { hit: true, confidence: 0.7 };
    }
    // Look back at last 5 turns for sleep-related mentions
    const lastFew = state.history.slice(-5).map((h) => normalizeInput(h.user));
    const sleepMentions = lastFew.filter(
      (x) => x.includes("sleep") || x.includes("tired")
    );
    if (sleepMentions.length >= 3) {
      return { hit: true, confidence: 0.6 };
    }
    return { hit: false };
  }
});

/** Relationship Abuse */
detectors.push({
  id: "relationship_abuse_signal",
  description: "Detects unhealthy or abusive relationship signals",
  detect: (input) => {
    const text = normalizeInput(input);
    const phrases = [
      "my partner yells at me",
      "controlling",
      "abusive relationship",
      "gaslighting"
    ];
    return phrases.some((p) => text.includes(p))
      ? { hit: true, confidence: 0.8 }
      : { hit: false };
  }
});

/** Financial Stress */
detectors.push({
  id: "financial_stress",
  description: "Detects money stress and financial pressure",
  detect: (input) => {
    const text = normalizeInput(input);
    const moneyWords = ["bills", "debt", "rent", "money problems", "broke"];
    return moneyWords.some((w) => text.includes(w))
      ? { hit: true, confidence: 0.6 }
      : { hit: false };
  }
});

/* -------------------- Detector Runner -------------------- */

/**
 * runPatternDetectorsForInput
 * - Runs detectors and computes baseline keyword analysis
 */
export function runPatternDetectorsForInput(input, state) {
  const tokens = tokenize(input);
  const categoryScores = {};

  // Compute baseline from keywords in JSON
  for (const [category, keywords] of Object.entries(conversationData.keywords)) {
    let score = 0;
    for (const kw of keywords) {
      if (tokens.includes(kw.word)) score += kw.weight;
    }
    if (score > 0) categoryScores[category] = score;
  }

  // Run detectors
  const hits = [];
  for (const det of detectors) {
    try {
      const result = det.detect(input, state, { categoryScores });
      if (result && result.hit) {
        hits.push({ id: det.id, confidence: result.confidence || 0.5 });
      }
    } catch (err) {
      // fail safe, never throw
      console.error(`Detector ${det.id} error:`, err.message);
    }
  }

  const analysis = {
    categoryScores,
    negation: false,
    intensity: 1
  };

  return { analysis, hits };
}
