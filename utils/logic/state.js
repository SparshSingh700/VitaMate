/*******************************************************
 * state.js
 *
 * ConversationState class for VitaMate AI engine.
 * - Tracks conversation history
 * - Maintains memory store
 * - Tracks intervention flows (multi-step interactions)
 *
 * Converted to ES6 module style (import / export).
 *
 * Place this file at: utils/logic/state.js
 *******************************************************/

"use strict";

export default class ConversationState {
  constructor() {
    // Conversation history: array of { user, ai }
    this.history = [];

    // Memory (themes, facts, interventions, etc.)
    this.memory = {
      items: new Map(),
      turn: 0
    };

    // Active intervention flow
    this.activeFlow = null;
    this.flowStep = null;

    // Metadata about interventions (offers, completions, clarifications)
    this.interventionMeta = {
      offers: {},        // { flowId: { count, lastOfferedTurn } }
      completions: {},   // { flowId: { count, lastCompletedTurn } }
      clarifyCounts: {}  // { flowId: { stepKey: count } }
    };
  }

  /* -------------------- Conversation History -------------------- */

  addHistory(userInput, aiResponse) {
    this.history.push({ user: userInput, ai: aiResponse });
  }

  getLastUserMessage() {
    const last = this.history[this.history.length - 1];
    return last ? last.user : null;
  }

  getLastAiMessage() {
    const last = this.history[this.history.length - 1];
    return last ? last.ai : null;
  }

  getHistoryWindow(n = 5) {
    return this.history.slice(-n);
  }

  /* -------------------- Memory Helpers -------------------- */

  ensureMemory() {
    if (!this.memory) {
      this.memory = { items: new Map(), turn: 0 };
    }
  }

  getMemoryItem(key) {
    this.ensureMemory();
    return this.memory.items.get(key) || null;
  }

  setMemoryItem(key, value) {
    this.ensureMemory();
    this.memory.items.set(key, value);
  }

  deleteMemoryItem(key) {
    this.ensureMemory();
    this.memory.items.delete(key);
  }

  clearMemory() {
    this.memory = { items: new Map(), turn: 0 };
  }

  /* -------------------- Intervention Flow -------------------- */

  setFlow(flowId, step) {
    this.activeFlow = flowId;
    this.flowStep = step;
  }

  resetFlow() {
    this.activeFlow = null;
    this.flowStep = null;
  }

  ensureInterventionMeta() {
    if (!this.interventionMeta) {
      this.interventionMeta = {
        offers: {},
        completions: {},
        clarifyCounts: {}
      };
    }
  }

  /* -------------------- Debug Helpers -------------------- */

  debugState() {
    return {
      historyLength: this.history.length,
      activeFlow: this.activeFlow,
      flowStep: this.flowStep,
      memorySize: this.memory.items.size,
      offers: this.interventionMeta.offers,
      completions: this.interventionMeta.completions
    };
  }
}
