/*******************************************************
 * techniques.js
 *
 * Small library of brief, evidence-based techniques for VitaMate.
 * Exported as simple functions that return a text script or object.
 *******************************************************/

"use strict";

import conversationData from "../../data/conversationLogic.json";

/* helper to format steps */
function formatTechnique(tech) {
  let out = `Technique: ${tech.title}\n${tech.desc}\n\nSteps:\n`;
  tech.steps.forEach((s, i) => {
    out += `${i + 1}. ${s}\n`;
  });
  out += `\n(Duration: ~${tech.duration_minutes} minute${tech.duration_minutes > 1 ? "s" : ""})`;
  return out;
}

export function getTechniqueById(id) {
  const data = conversationData.techniques_short || conversationData.techniques || conversationData.techniques_short;
  const tech = data?.[id];
  if (!tech) return null;
  return { id, ...tech };
}

export function getTechniqueScript(id) {
  const tech = getTechniqueById(id);
  if (!tech) return null;
  return formatTechnique(tech);
}

/* Export a convenience list */
export function listTechniques() {
  const data = conversationData.techniques_short || {};
  return Object.keys(data).map((k) => ({ id: k, title: data[k].title }));
}
