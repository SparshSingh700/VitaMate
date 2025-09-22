/*******************************************************
 * flow.js
 *
 * Flow manager for VitaMate AI:
 *  - Tracks and advances guided interventions
 *  - Supports step-based flows from conversationLogic.json
 *  - Handles flow offers, clarifications, completions
 *
 * Exported API:
 *   - maybeOfferIntervention(state, analysis, detectors)
 *   - advanceFlow(state, userInput)
 *   - resetFlowState(state)
 *
 * Converted to ES6 module style.
 *******************************************************/

"use strict";

import conversationData from "../../data/conversationLogic.json";

/* -------------------- Helpers -------------------- */

/**
 * Get a flow definition by ID from JSON
 */
function getFlowDef(flowId) {
  return conversationData.intervention_flows?.[flowId] || null;
}

/**
 * Check if flow is available to offer
 */
function canOfferFlow(state, flowId) {
  const offers = state.interventionMeta.offers[flowId] || { count: 0 };
  const completions = state.interventionMeta.completions[flowId] || { count: 0 };

  // Don’t spam: max 2 offers if never accepted
  if (offers.count >= 2 && completions.count === 0) return false;
  return true;
}

/* -------------------- Flow Offer -------------------- */

/**
 * maybeOfferIntervention:
 *  - Based on detectors and analysis, suggest a flow
 */
export function maybeOfferIntervention(state, analysis, detectors) {
  if (!detectors || detectors.length === 0) return null;

  // pick top detector
  const top = detectors[0];
  const flowMap = conversationData.detector_to_flow || {};
  const flowId = flowMap[top.id];
  if (!flowId) return null;

  if (!canOfferFlow(state, flowId)) return null;

  // record offer
  if (!state.interventionMeta.offers[flowId]) {
    state.interventionMeta.offers[flowId] = { count: 0, lastOfferedTurn: 0 };
  }
  state.interventionMeta.offers[flowId].count += 1;
  state.interventionMeta.offers[flowId].lastOfferedTurn = state.memory.turn;

  return {
    flowId,
    reason: top,
    flowDef: getFlowDef(flowId)
  };
}

/* -------------------- Flow Advancement -------------------- */

/**
 * advanceFlow:
 * - Given user input, progress through flow steps
 * - Returns next step object or completion
 */
export function advanceFlow(state, userInput) {
  if (!state.activeFlow) return null;

  const flowId = state.activeFlow;
  const flowDef = getFlowDef(flowId);
  if (!flowDef) {
    state.resetFlow();
    return null;
  }

  let stepKey = state.flowStep || "step1";
  const step = flowDef[stepKey];

  if (!step) {
    state.resetFlow();
    return null;
  }

  // Simple branching: if userInput matches option, go to mapped step
  let nextStepKey = null;
  if (step.options && step.branches) {
    const normalized = userInput.trim().toLowerCase();
    for (let i = 0; i < step.options.length; i++) {
      const opt = step.options[i].toLowerCase();
      if (normalized.includes(opt)) {
        nextStepKey = step.branches[i];
        break;
      }
    }
  }

  // Default: go to next sequential step
  if (!nextStepKey && step.next) {
    nextStepKey = step.next;
  }

  // Flow completed
  if (!nextStepKey) {
    // record completion
    if (!state.interventionMeta.completions[flowId]) {
      state.interventionMeta.completions[flowId] = {
        count: 0,
        lastCompletedTurn: 0
      };
    }
    state.interventionMeta.completions[flowId].count += 1;
    state.interventionMeta.completions[flowId].lastCompletedTurn =
      state.memory.turn;

    state.resetFlow();
    return { completed: true, message: flowDef.completion_text || "Nice work completing this exercise." };
  }

  // Set next step
  state.setFlow(flowId, nextStepKey);
  return { step: flowDef[nextStepKey] };
}

/* -------------------- Flow Reset -------------------- */

export function resetFlowState(state) {
  state.resetFlow();
}
