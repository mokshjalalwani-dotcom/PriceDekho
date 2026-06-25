/**
 * Calculates Levenshtein distance between two strings
 */
const levenshtein = (a, b) => {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          Math.min(matrix[i][j - 1] + 1, // insertion
                   matrix[i - 1][j] + 1) // deletion
        );
      }
    }
  }

  return matrix[b.length][a.length];
};

/**
 * Calculates similarity score between 0 and 1.
 */
const getSimilarity = (s1, s2) => {
  const maxLength = Math.max(s1.length, s2.length);
  if (maxLength === 0) return 1.0;
  const distance = levenshtein(s1, s2);
  return (maxLength - distance) / maxLength;
};

/**
 * Fuzzy match a string against a map of normalized names to ObjectIds.
 * @param {string} input - The raw input string from the sheet
 * @param {Object} map - Map of { "normalized name": "ObjectId" }
 * @returns {Object|null} { id, matchedName, confidence, matchType }
 */
export const fuzzyMatch = (input, map) => {
  if (!input || typeof input !== 'string') return null;

  const trimmed = input.trim();
  const normalized = trimmed.toLowerCase();

  // 1. Exact Match (Fast path)
  // If the normalized input exactly matches a key in the map
  if (map[normalized]) {
    return {
      id: map[normalized],
      matchedName: normalized,
      confidence: 1.0,
      matchType: 'exact'
    };
  }

  // 2. Fuzzy Match
  // Compare against all keys and find the best similarity score
  let bestMatch = null;
  let highestScore = 0;

  for (const key of Object.keys(map)) {
    const score = getSimilarity(normalized, key);
    if (score > highestScore) {
      highestScore = score;
      bestMatch = key;
    }
  }

  // Reject if confidence is below 0.75
  if (highestScore < 0.75) {
    return null; // Rejected
  }

  return {
    id: map[bestMatch],
    matchedName: bestMatch,
    confidence: Number(highestScore.toFixed(3)),
    matchType: 'fuzzy'
  };
};
