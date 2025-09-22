/*******************************************************
 * memory.js
 *
 * Memory augmentation for VitaMate AI:
 *  - Stores and recalls user themes/facts
 *  - Enhances replies with personalized context
 *  - Supports theme detection, tagging, and expiration
 *
 * Exported API:
 *   - storeThemeMention(state, category, input)
 *   - recallThemes(state, limit)
 *   - augmentReplyWithMemory(state, reply, analysis)
 *******************************************************/

"use strict";

import { normalizeInput, tokenize } from "./utils.js";

/* -------------------- Theme Storage -------------------- */

/**
 * Store a theme mention in memory
 * - Keyed by category
 * - Saves examples of what user said
 */
export function storeThemeMention(state, category, input) {
  if (!category) return;

  let existing = state.getMemoryItem(category);
  if (!existing) {
    existing = { mentions: [], lastTurn: 0 };
  }

  existing.mentions.push(input);
  existing.lastTurn = state.memory.turn;

  state.setMemoryItem(category, existing);
}

/**
 * Recall stored themes
 */
export function recallThemes(state, limit = 3) {
  const themes = [];
  for (const [key, value] of state.memory.items.entries()) {
    if (value.mentions && value.mentions.length > 0) {
      themes.push({
        category: key,
        lastMention: value.mentions[value.mentions.length - 1],
        lastTurn: value.lastTurn
      });
    }
  }

  // Sort by recency
  themes.sort((a, b) => b.lastTurn - a.lastTurn);
  return themes.slice(0, limit);
}

/* -------------------- Reply Augmentation -------------------- */

/**
 * Insert memory recall into AI reply
 */
export function augmentReplyWithMemory(state, reply, analysis) {
  const themes = recallThemes(state, 2);

  if (themes.length > 0) {
    const additions = [];
    for (const th of themes) {
      additions.push(
        `Earlier you mentioned about ${th.category} (e.g., "${th.lastMention}").`
      );
    }
    reply += " " + additions.join(" ");
  }

  // Track if analysis categories should update memory
  if (analysis && analysis.categoryScores) {
    for (const [cat, score] of Object.entries(analysis.categoryScores)) {
      if (score >= 2) {
        storeThemeMention(state, cat, state.getLastUserMessage() || "");
      }
    }
  }

  return reply;
}

/* -------------------- Fact Storage -------------------- */

/**
 * Store explicit user facts (like "I am a student")
 */
export function storeFact(state, key, value) {
  let facts = state.getMemoryItem("facts") || {};
  facts[key] = value;
  state.setMemoryItem("facts", facts);
}

/**
 * Recall stored facts
 */
export function recallFacts(state) {
  return state.getMemoryItem("facts") || {};
}

/* -------------------- Entity Tagging -------------------- */

/**
 * Extract simple entities (name, job, location) from input
 */
export function detectAndStoreEntities(state, input) {
  const text = normalizeInput(input);
  const tokens = tokenize(text);

  // Naive detection rules
  if (text.includes("my name is")) {
    const parts = text.split("my name is");
    if (parts[1]) {
      const name = parts[1].trim().split(" ")[0];
      storeFact(state, "name", name);
    }
  }

  if (text.includes("i work as")) {
    const parts = text.split("i work as");
    if (parts[1]) {
      const job = parts[1].trim().split(" ")[0];
      storeFact(state, "job", job);
    }
  }

  if (tokens.includes("from")) {
    const idx = tokens.indexOf("from");
    if (idx !== -1 && idx + 1 < tokens.length) {
      const location = tokens[idx + 1];
      storeFact(state, "location", location);
    }
  }
}

/* -------------------- Expiration / Reset -------------------- */

/**
 * Forget old memories after N turns
 */
export function expireOldMemories(state, maxAge = 30) {
  const turn = state.memory.turn;
  for (const [key, value] of state.memory.items.entries()) {
    if (value.lastTurn && turn - value.lastTurn > maxAge) {
      state.deleteMemoryItem(key);
    }
  }
}

/**
 * Clear all memory
 */
export function clearAllMemory(state) {
  state.clearMemory();
}
