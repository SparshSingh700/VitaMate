/*******************************************************
 * controller.js
 *
 * Central orchestrator for VitaMate AI logic engine.
 *  - Detects categories, runs detectors
 *  - Updates memory & entities
 *  - Handles flows and interventions
 *  - Composes replies with compassionate mode
 *  - Offers techniques when therapistTone is true
 *  - Routes yes/no responses after offers
 *******************************************************/

"use strict";

import { runPatternDetectorsForInput } from "./detectors.js";
import { composeFullReply, produceTechniqueScript } from "./composer.js";
import {
  maybeOfferIntervention,
  advanceFlow,
  resetFlowState
} from "./flow.js";
import {
  storeThemeMention,
  detectAndStoreEntities,
  expireOldMemories
} from "./memory.js";
import { applySafetyOverride } from "./safety.js";
import { normalizeInput } from "./utils.js";

/* -------------------- Process User Input -------------------- */

export function processUserInput(userInput, state, options = {}) {
  const therapistTone = options.therapistTone ?? false;

  if (!userInput || typeof userInput !== "string") {
    return "I’m here to listen whenever you feel ready to share.";
  }

  // Turn counter
  state.memory.turn += 1;

  const normalized = normalizeInput(userInput);

  // Step 1: detectors
  const { analysis, hits } = runPatternDetectorsForInput(userInput, state);

  // Step 2: memory updates
  detectAndStoreEntities(state, userInput);
  for (const [cat, score] of Object.entries(analysis.categoryScores)) {
    if (score >= 2) {
      storeThemeMention(state, cat, userInput);
    }
  }
  expireOldMemories(state, 30);

  // Step 3: flow
  let flowStep = null;
  let offeredIntervention = null;

  if (state.activeFlow) {
    const res = advanceFlow(state, userInput);
    if (res?.step) {
      flowStep = res.step;
    } else if (res?.completed) {
      flowStep = { text: res.message };
    }
  } else {
    offeredIntervention = maybeOfferIntervention(state, analysis, hits);
    if (offeredIntervention) {
      state.setFlow(offeredIntervention.flowId, "step1");
    }
  }

  // Step 4: handle yes/no after permission prompt
  let aiReply = "";
  if (/^(yes|sure|okay|ok|alright)$/i.test(normalized)) {
    // user accepted a suggested technique
    const script = produceTechniqueScript("box_breathing") ||
                   "Great — let’s start with Box Breathing.\nBreathe in 4, hold 4, out 4, hold 4. Repeat 3–4 times.";
    aiReply = script;
  } else if (/^(no|not now|maybe later)$/i.test(normalized)) {
    // user declined
    aiReply =
      "That’s completely fine. We can just talk, or you can let me know if you’d like a short exercise later.";
  }

  // Step 5: if no yes/no handling, compose normal reply
  if (!aiReply) {
    aiReply = composeFullReply(
      analysis,
      hits,
      offeredIntervention,
      flowStep,
      state,
      userInput
    );
  }

  // Step 6: Safety
  aiReply = applySafetyOverride(state, userInput, aiReply);

  // Step 7: History
  state.addHistory(userInput, aiReply);

  return aiReply;
}

/* -------------------- Reset -------------------- */

export function resetEngine(state) {
  state.clearMemory();
  resetFlowState(state);
  state.history = [];
  state.interventionMeta = { offers: {}, completions: {}, clarifyCounts: {} };
}
