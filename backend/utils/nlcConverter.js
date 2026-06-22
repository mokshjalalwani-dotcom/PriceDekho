export const NLC_MAP = {
  '1': 'L',
  '2': 'R',
  '3': 'D',
  '4': 'H',
  '5': 'S',
  '6': 'C',
  '7': 'T',
  '8': 'B',
  '9': 'Q',
  '0': 'Y'
};

export const NLC_REVERSE_MAP = Object.fromEntries(
  Object.entries(NLC_MAP).map(([k, v]) => [v, k])
);

/**
 * Converts numbers 0-9 to their NLC letter equivalents.
 * Ignores spaces and preserves existing letters/symbols.
 */
export const convertToNLC = (input) => {
  if (input === null || input === undefined) return '';
  const str = String(input).replace(/\s+/g, ''); // ignore spaces
  let result = '';
  for (const char of str) {
    if (NLC_MAP[char]) {
      result += NLC_MAP[char];
    } else {
      result += char;
    }
  }
  return result;
};

/**
 * Converts NLC letters back to numbers (for debugging/internal use).
 * Preserves non-mapped characters.
 */
export const convertFromNLC = (input) => {
  if (input === null || input === undefined) return '';
  const str = String(input).toUpperCase(); // ensure uppercase for matching
  let result = '';
  for (const char of str) {
    if (NLC_REVERSE_MAP[char]) {
      result += NLC_REVERSE_MAP[char];
    } else {
      result += char; // preserve original casing if we want, but simple for now
    }
  }
  // To strictly preserve casing of non-mapped characters, let's use the original character
  let finalResult = '';
  const originalStr = String(input);
  for (let i = 0; i < originalStr.length; i++) {
    const char = originalStr[i];
    const upperChar = char.toUpperCase();
    if (NLC_REVERSE_MAP[upperChar]) {
      finalResult += NLC_REVERSE_MAP[upperChar];
    } else {
      finalResult += char;
    }
  }
  return finalResult;
};
