/*******************************************************
 * conversationLogic.js
 *
 * Public wrapper for VitaMate AI logic engine.
 *  - Manages a singleton ConversationState
 *  - Provides public API for React Native screens:
 *      getDynamicResponse(userInput)
 *      resetConversation()
 *      getConversationHistory()
 *      debugEngineState()
 *      setTherapistTone(bool)
 *  - Injects optional therapistTone mode (compassionate)
 *******************************************************/

"use strict";

import ConversationState from "./logic/state.js";
import { processUserInput, resetEngine } from "./logic/controller.js";
import { produceTechniqueScript } from "./logic/composer.js";

/* -------------------- Singleton State -------------------- */

let globalState = null;
let therapistTone = true; // default ON

function ensureState() {
  if (!globalState) {
    globalState = new ConversationState();
  }
  return globalState;
}

/* -------------------- Public API -------------------- */

/**
 * getDynamicResponse
 * - Returns either a normal message or a choice prompt
 * - Adds therapist tone layer if enabled
 */
export function getDynamicResponse(userInput) {
  const state = ensureState();

  try {
    // Run main engine
    let replyText = processUserInput(userInput, state, { therapistTone });

    // Handle technique trigger
    if (/^technique:/i.test(userInput.trim())) {
      const id = userInput.trim().replace(/^technique:/i, "").trim();
      const script = produceTechniqueScript(id);
      if (script) {
        replyText = script;
      } else {
        replyText =
          "I couldn’t find that technique, but I can share Box Breathing or Grounding if you’d like.";
      }
    }

    // Detect choice-style replies
    if (replyText.includes("\nOptions:")) {
      const [mainText, optsBlock] = replyText.split("\nOptions:");
      const options = optsBlock
        .split("\n")
        .map((line) => line.replace(/^\d+\.\s*/, "").trim())
        .filter(Boolean);

      return { type: "choice", text: mainText.trim(), options };
    }

    return { type: "message", text: replyText };
  } catch (err) {
    console.error("Error in getDynamicResponse:", err);
    return {
      type: "message",
      text:
        "I’m having some trouble finding the right words. Could you try rephrasing or tell me in another way?"
    };
  }
}

/**
 * resetConversation
 * - Clears memory, flows, and history
 */
export function resetConversation() {
  const state = ensureState();
  resetEngine(state);
  globalState = new ConversationState();
}

/**
 * getConversationHistory
 * - Returns past messages (user + AI)
 */
export function getConversationHistory() {
  const state = ensureState();
  return state.history;
}

/**
 * debugEngineState
 * - Snapshot of engine internals
 */
export function debugEngineState() {
  const state = ensureState();
  return state.debugState();
}

/**
 * setTherapistTone
 * - Globally toggle compassionate/clinical style
 */
export function setTherapistTone(val = true) {
  therapistTone = !!val;
}

/**
 * getTherapistTone
 */
export function getTherapistTone() {
  return therapistTone;
}
