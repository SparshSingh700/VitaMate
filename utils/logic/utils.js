/*******************************************************
 * utils.js
 *
 * Shared helper functions for VitaMate AI logic:
 *  - Random selection
 *  - Input normalization
 *  - Tokenization
 *  - Negation detection
 *  - String similarity / scoring helpers
 *
 * Exported functions are pure utilities (no state).
 *******************************************************/

"use strict";

/* -------------------- Random Helpers -------------------- */

/**
 * Pick a random element from an array
 */
export function randomChoice(arr) {
  if (!arr || arr.length === 0) return null;
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Shuffle an array (Fisher-Yates)
 */
export function shuffleArray(arr) {
  const copy = arr.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/* -------------------- Text Normalization -------------------- */

/**
 * Normalize input to lowercase, trimmed, no punctuation
 */
export function normalizeInput(str) {
  if (!str || typeof str !== "string") return "";
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Tokenize into words
 */
export function tokenize(str) {
  return normalizeInput(str).split(" ").filter(Boolean);
}

/* -------------------- Negation Detection -------------------- */

/**
 * Detect if the input contains negation words
 */
export function hasNegation(str) {
  const tokens = tokenize(str);
  const negations = ["not", "never", "no", "cannot", "can't", "dont", "don’t"];
  return tokens.some((t) => negations.includes(t));
}

/* -------------------- Similarity / Scoring -------------------- */

/**
 * Simple Jaccard similarity between two strings
 */
export function jaccardSimilarity(str1, str2) {
  const set1 = new Set(tokenize(str1));
  const set2 = new Set(tokenize(str2));
  const intersection = new Set([...set1].filter((x) => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  return union.size === 0 ? 0 : intersection.size / union.size;
}

/**
 * Count keyword matches from a list
 */
export function keywordMatchScore(tokens, keywords) {
  let score = 0;
  for (const kw of keywords) {
    if (tokens.includes(kw.word)) score += kw.weight || 1;
  }
  return score;
}

/* -------------------- Time Helpers -------------------- */

/**
 * Get current timestamp
 */
export function now() {
  return Date.now();
}

/**
 * Format timestamp for logs
 */
export function formatTimestamp(ts) {
  const d = new Date(ts);
  return d.toISOString();
}
