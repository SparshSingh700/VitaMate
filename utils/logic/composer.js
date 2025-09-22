/*******************************************************
 * composer.js (therapeutic, compassionate variant)
 *
 * - Uses reflective listening (simple summarization)
 * - Prioritizes validation and warmth
 * - Asks permission before giving techniques
 * - Can attach technique scripts from techniques.js
 *******************************************************/

"use strict";

import { randomChoice, hasNegation, tokenize, normalizeInput } from "./utils.js";
import conversationData from "../../data/conversationLogic.json";
import { augmentReplyWithMemory } from "./memory.js";
import { getTechniqueScript, listTechniques } from "./techniques.js";

/* ---------- Helper: reflective summary (short) ---------- */
function reflectiveSummary(userInput) {
  // Very small, safe summarizer: extract main verb and noun phrases (simple heuristic)
  // We'll extract first 6-10 words as a "reflection" to avoid hallucination.
  const normalized = normalizeInput(userInput);
  const tokens = tokenize(normalized);
  if (tokens.length <= 10) return normalized;
  const slice = tokens.slice(0, Math.min(10, tokens.length)).join(" ");
  return slice + (tokens.length > 10 ? "…" : "");
}

/* ---------- Helper: permission-first preface ---------- */
function evidencePreface() {
  return conversationData.introduction_phrases?.evidence_preface || 
         "I can share brief, evidence-based techniques that many people find helpful. Would you like to try one?";
}

/* ---------- Fragment selection (preserve existing heavy fragments approach) ---------- */
export function pickFragments(analysis, maxFragments = 2) {
  const fragments = [];
  const categoryScores = analysis.categoryScores || {};
  const categoryEntries = Object.entries(categoryScores).sort((a,b)=> b[1] - a[1]);

  let picks = 0;
  for (const [cat] of categoryEntries) {
    if (picks >= maxFragments) break;
    const pool = conversationData.response_fragments?.[cat] || conversationData.responses?.[cat];
    if (pool && pool.length) {
      let candidate = randomChoice(pool);
      if (analysis.negation) {
        candidate = candidate.replace(/^Practical: /i, "Maybe: ");
      }
      fragments.push(candidate);
      picks++;
    }
  }

  // fallback
  if (fragments.length === 0) {
    const fallback = conversationData.response_fragments?.general_negative || conversationData.responses?.general_negative;
    fragments.push(randomChoice(fallback || ["Thanks for telling me that."]));
  }
  return fragments;
}

/* ---------- Main composer (compassionate, permission-first) ---------- */
export function composeFullReply(analysis, detectors, offeredIntervention, flowStep, state, userInput = "") {
  // 1) Opener: warm, validating
  const opener = randomChoice(conversationData.responses?.openers || [
    "Thank you for sharing that with me — I’m really glad you told me."
  ]);

  // 2) Reflective listening: short summary + validation
  const reflection = reflectiveSummary(userInput);
  const reflectPhrase = reflection ? `It sounds like: "${reflection}".` : "";

  const validation = pickFragments(analysis, 1)[0];

  // 3) Compose main body
  let bodyParts = [reflectPhrase, validation].filter(Boolean);

  // If top detector strongly indicates crisis, add a safety check line (but crisis handler normally overrides)
  if (detectors && detectors.length > 0) {
    const top = detectors[0];
    if (top.confidence >= 0.7) {
      bodyParts.push("I’m concerned by what you shared — would you say you feel in danger right now?");
    }
  }

  // 4) Permission before techniques
  const willOfferTechnique = offeredIntervention || (listTechniques().length > 0 && Math.random() < 0.35);
  let techniqueText = "";
  if (willOfferTechnique) {
    const pre = evidencePreface();
    techniqueText = pre;
  }

  // 5) Closer: supportive & next-step oriented
  const closer = randomChoice(conversationData.responses?.closers || [
    "I’m here with you. Would you like to try a small exercise together?"
  ]);

  // 6) Combine
  let reply = [opener, bodyParts.join(" "), techniqueText, closer].filter(Boolean).join(" ");

  // 7) If offeredIntervention is present and has flowDef.step1_text, append it (permission has been asked above)
  if (offeredIntervention && offeredIntervention.flowDef?.step1_text) {
    reply += `\n\n${offeredIntervention.flowDef.step1_text}`;
    if (offeredIntervention.flowDef?.step1_options?.length) {
      reply += `\nOptions:\n${offeredIntervention.flowDef.step1_options.map((o,i)=> `${i+1}. ${o}`).join("\n")}`;
    }
  }

  // 8) Memory augmentation
  reply = augmentReplyWithMemory(state, reply, analysis);

  return reply.trim();
}

/* ---------- Helper: produce technique script when asked ---------- */
export function produceTechniqueScript(techIdOrName) {
  // Try id first
  let script = getTechniqueScript(techIdOrName);
  if (script) return script;
  // try match by name from list
  const list = listTechniques();
  const found = list.find(t => t.title.toLowerCase().includes(String(techIdOrName).toLowerCase()) || t.id === techIdOrName);
  if (found) {
    return getTechniqueScript(found.id);
  }
  return null;
}
