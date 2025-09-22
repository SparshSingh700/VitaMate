/*******************************************************
 * safety.js
 *
 * Safety filters and fallback responses for VitaMate AI.
 *  - Detects crisis scenarios (suicide, self-harm, violence)
 *  - Detects harmful or unsafe topics (substance abuse, abuse)
 *  - Provides safe fallback messages
 *  - Can override normal conversation logic if critical
 *
 * Exported API:
 *   - checkSafety(userInput) -> { safe, category, message? }
 *   - applySafetyOverride(state, userInput, aiReply) -> string
 *******************************************************/

"use strict";

import { normalizeInput, tokenize } from "./utils.js";

/* -------------------- Crisis Keywords -------------------- */

const crisisKeywords = {
  suicide: [
    "suicide",
    "kill myself",
    "want to die",
    "end my life",
    "not worth living",
    "better off dead"
  ],
  selfHarm: [
    "cut myself",
    "hurting myself",
    "self harm",
    "bleeding",
    "burn myself"
  ],
  violence: [
    "kill them",
    "shoot someone",
    "stab someone",
    "hurt others",
    "murder"
  ]
};

/* -------------------- Sensitive Topics -------------------- */

const sensitiveKeywords = {
  substance: ["overdose", "drug abuse", "drank too much", "cocaine", "heroin"],
  abuse: ["abusive partner", "gaslighting", "domestic violence", "he hits me"]
};

/* -------------------- Crisis Fallback Messages -------------------- */

const crisisResponses = {
  suicide: [
    "I'm really concerned by what you said. You are not alone in this. Please, if you're thinking of suicide, call your local crisis hotline right now.",
    "Your safety is the most important thing. Please reach out immediately to a suicide prevention hotline or emergency services.",
    "It sounds like you're in deep pain. I strongly encourage you to contact professional help — you deserve support and care."
  ],
  selfHarm: [
    "I'm really sorry you're feeling like hurting yourself. Please talk to a trusted friend, family member, or professional immediately.",
    "Self-harm is serious. I care about your safety. Please reach out to a professional crisis line in your area.",
    "If you're at risk of hurting yourself, please stop and call a helpline or emergency number right away."
  ],
  violence: [
    "I cannot support or encourage violence. If you are feeling like harming others, please seek immediate professional help.",
    "Your feelings matter, but violence is not the solution. Please reach out to a counselor or professional right now.",
    "I need to step back here — harming others is unsafe. Please contact emergency services or a mental health professional."
  ]
};

const sensitiveResponses = {
  substance: [
    "It sounds like you may be struggling with substance use. I'm not a replacement for medical help, but reaching out to a professional could make a difference.",
    "Managing substances can be very tough. Please consider talking to a counselor, doctor, or a support group.",
    "If you're using substances in a way that's hurting you, I encourage you to reach out to a professional for safe guidance."
  ],
  abuse: [
    "I'm really sorry you're experiencing abuse. You deserve to be safe and respected. Please contact a trusted person or a local helpline.",
    "Abuse is not okay. If you're in danger, please call emergency services or a domestic violence hotline immediately.",
    "You are not alone. Please seek help from a trusted support service in your area."
  ]
};

/* -------------------- Safety Checker -------------------- */

/**
 * checkSafety
 * - Examines input for unsafe content
 * - Returns { safe, category, message? }
 */
export function checkSafety(userInput) {
  const text = normalizeInput(userInput);

  // Crisis checks
  for (const [cat, kws] of Object.entries(crisisKeywords)) {
    if (kws.some((kw) => text.includes(kw))) {
      return {
        safe: false,
        category: cat,
        message: crisisResponses[cat][
          Math.floor(Math.random() * crisisResponses[cat].length)
        ]
      };
    }
  }

  // Sensitive topic checks (not immediate crisis, but redirect)
  for (const [cat, kws] of Object.entries(sensitiveKeywords)) {
    if (kws.some((kw) => text.includes(kw))) {
      return {
        safe: false,
        category: cat,
        message: sensitiveResponses[cat][
          Math.floor(Math.random() * sensitiveResponses[cat].length)
        ]
      };
    }
  }

  // Safe by default
  return { safe: true, category: null };
}

/* -------------------- Safety Override -------------------- */

/**
 * applySafetyOverride
 * - Runs checkSafety and returns either:
 *   (a) crisis message, overriding AI reply
 *   (b) normal AI reply if safe
 */
export function applySafetyOverride(state, userInput, aiReply) {
  const result = checkSafety(userInput);
  if (!result.safe && result.message) {
    // Safety override engaged
    return result.message;
  }
  return aiReply;
}
