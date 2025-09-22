// utils/voiceParser.js

// --- 1. LEXICON & KNOWLEDGE BASE ---
const LEXICON = {
    INTENTS: {
        LOG_WATER: { keywords: ['water', 'hydrate', 'drink', 'drank'] },
        LOG_SLEEP: { keywords: ['sleep', 'slept', 'nap', 'napped'] },
        SET_MOOD: { keywords: ['mood', 'feel', 'feeling', 'am'] },
    },
    ENTITIES: {
        UNITS_WATER: {
            ml: { keywords: ['ml', 'millilitre', 'millilitres'], multiplier: 1 },
            litre: { keywords: ['litre', 'liter', 'l'], multiplier: 1000 },
            glass: { keywords: ['glass', 'glasses'], multiplier: 250 },
            bottle: { keywords: ['bottle', 'bottles'], multiplier: 500 },
        },
        UNITS_SLEEP: {
            hours: { keywords: ['hour', 'hours', 'hr', 'hrs'] },
            minutes: { keywords: ['minute', 'minutes', 'min'] },
        },
        // --- THIS IS THE FIX: The structure now correctly includes the 'keywords' property ---
        MOOD_VALUES: {
            Happy: { keywords: ['happy', 'great', 'good', 'fantastic', 'amazing', 'wonderful'] },
            Calm: { keywords: ['calm', 'relaxed', 'peaceful', 'chill', 'serene'] },
            Tired: { keywords: ['tired', 'exhausted', 'sleepy', 'drained', 'fatigued'] },
            Stressed: { keywords: ['stressed', 'anxious', 'overwhelmed', 'freaking out', 'tense'] },
            Sad: { keywords: ['sad', 'down', 'upset', 'miserable', 'blue'] },
        },
        POLARITY_NEGATIVE: ['remove', 'subtract', 'minus', 'take away', 'delete'],
        NUMBER_WORDS: { 'a': 1, 'an': 1, 'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5, 'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10, 'half': 0.5 },
    },
};

// --- 2. PIPELINE STAGE: NORMALIZATION ---
const normalizeText = (text) => {
    if (!text || typeof text !== 'string') return '';
    return text.toLowerCase().replace(/[^a-z0-9.\s]/g, ' ').replace(/\s+/g, ' ').trim();
};

// --- 3. PIPELINE STAGE: ENTITY EXTRACTION ---
const extractNumericValue = (text) => {
    const numberMatch = text.match(/(\d+(\.\d+)?)/);
    if (numberMatch) return parseFloat(numberMatch[0]);

    for (const word in LEXICON.ENTITIES.NUMBER_WORDS) {
        if (new RegExp(`\\b${word}\\b`).test(text)) {
            return LEXICON.ENTITIES.NUMBER_WORDS[word];
        }
    }
    return null;
};

const extractCanonicalEntity = (text, entityMap) => {
    for (const value in entityMap) {
        if (entityMap[value].keywords.some(synonym => new RegExp(`\\b${synonym}\\b`).test(text))) {
            return value;
        }
    }
    return null;
};

// --- 4. PIPELINE STAGE: INTENT CLASSIFICATION ---
const scoreIntent = (text, amount, intent) => {
    let score = 0;
    const intentKeywords = LEXICON.INTENTS[intent].keywords;
    if (intentKeywords.some(keyword => text.includes(keyword))) {
        score += 2;
    }

    switch (intent) {
        case 'LOG_WATER':
            if (amount !== null) score += 2;
            if (extractCanonicalEntity(text, LEXICON.ENTITIES.UNITS_WATER)) score += 2;
            break;
        case 'LOG_SLEEP':
            if (amount !== null) score += 2;
            if (extractCanonicalEntity(text, LEXICON.ENTITIES.UNITS_SLEEP)) score += 2;
            break;
        case 'SET_MOOD':
            if (extractCanonicalEntity(text, LEXICON.ENTITIES.MOOD_VALUES)) score += 3;
            break;
    }
    return score;
};

// --- 5. PIPELINE STAGE: RESOLUTION ---
export const parseVoiceCommand = (text) => {
    const normalized = normalizeText(text);
    if (!normalized) return { type: 'UNKNOWN', payload: { originalText: text } };

    const amount = extractNumericValue(normalized);
    const isNegative = LEXICON.ENTITIES.POLARITY_NEGATIVE.some(keyword => normalized.includes(keyword));

    const intentScores = {
        LOG_WATER: scoreIntent(normalized, amount, 'LOG_WATER'),
        LOG_SLEEP: scoreIntent(normalized, amount, 'LOG_SLEEP'),
        SET_MOOD: scoreIntent(normalized, amount, 'SET_MOOD'),
    };

    const topIntent = Object.keys(intentScores).reduce((a, b) => intentScores[a] > intentScores[b] ? a : b);

    if (intentScores[topIntent] > 2) {
        switch (topIntent) {
            case 'LOG_WATER': {
                if (amount === null) break;
                let finalAmount = amount;
                const unit = extractCanonicalEntity(normalized, LEXICON.ENTITIES.UNITS_WATER);
                if (unit && LEXICON.ENTITIES.UNITS_WATER[unit].multiplier) {
                    finalAmount = amount * LEXICON.ENTITIES.UNITS_WATER[unit].multiplier;
                }
                return { type: 'LOG_WATER', payload: { amount: isNegative ? -finalAmount : finalAmount } };
            }
            case 'LOG_SLEEP': {
                if (amount === null) break;
                let finalHours = amount;
                const unit = extractCanonicalEntity(normalized, LEXICON.ENTITIES.UNITS_SLEEP);
                if (unit === 'minutes') {
                    finalHours = amount / 60;
                }
                return { type: 'LOG_SLEEP', payload: { hours: finalHours } };
            }
            case 'SET_MOOD': {
                const mood = extractCanonicalEntity(normalized, LEXICON.ENTITIES.MOOD_VALUES);
                if (mood) {
                    return { type: 'SET_MOOD', payload: { mood } };
                }
                break;
            }
        }
    }

    return { type: 'UNKNOWN', payload: { originalText: text } };
};