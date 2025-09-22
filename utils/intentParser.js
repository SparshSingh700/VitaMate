// A simple regex to find a number and a word, e.g., "2 roti" or "500ml water"
const quantityRegex = /(\d+)\s*(\w+)/;

const KEYWORDS = {
  MEAL: ['ate', 'eat', 'had a', 'meal'],
  MOOD: ['feel', 'feeling', 'mood is'],
};

export const parseVoiceCommand = (text) => {
  const lowerCaseText = text.toLowerCase();

  if (KEYWORDS.MEAL.some(keyword => lowerCaseText.includes(keyword))) {
    const match = lowerCaseText.match(quantityRegex);
    if (match) {
      const quantity = parseInt(match[1], 10);
      const item = match[2];
      return { type: 'ADD_MEAL', payload: { quantity, item, originalText: text } };
    }
    return { type: 'ADD_MEAL', payload: { originalText: text } };
  }

  if (KEYWORDS.MOOD.some(keyword => lowerCaseText.includes(keyword))) {
    return { type: 'SET_MOOD', payload: { originalText: text } };
  }

  return { type: 'UNKNOWN', payload: { originalText: text } };
};