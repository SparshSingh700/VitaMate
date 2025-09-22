/*******************************************************
 * index.js
 *
 * Primary entrypoint for the logic/ module.
 * Exports the processUserInput controller and ConversationState
 * so your application can easily use:
 *
 * const { processUserInput, ConversationState } = require('./logic');
 *
 * NOTE: controller.js must exist in the same folder and export
 * processUserInput (module.exports.processUserInput = ...).
 *******************************************************/

"use strict";

const path = require("path");

// Export ConversationState so callers can create state objects
const ConversationState = require("./state");

// Import the main controller (controller.js should export processUserInput)
let controller;
try {
  controller = require("./controller");
} catch (err) {
  // Graceful fallback if controller isn't present yet.
  controller = {};
}

/**
 * processUserInput wrapper:
 * - Exposes controller.processUserInput if present; otherwise throws helpful error.
 */
function processUserInput(userInput, state) {
  if (!controller || typeof controller.processUserInput !== "function") {
    throw new Error(
      "processUserInput is not available. Make sure './controller.js' exists and exports processUserInput."
    );
  }
  return controller.processUserInput(userInput, state);
}

// Export a small API surface
module.exports = {
  processUserInput,
  ConversationState,
  // also expose the controller module for advanced use if present
  controller
};
