/**
 * ============================================================
 *  DETERMINISTIC DIFF ENGINE
 *  Compares a sheet row (incoming) against the existing DB doc.
 *  Returns: { isNew, hasChanges, changedFields }
 *
 *  Rules:
 *  - normalize strings (trim)
 *  - coerce numerics so "100" === 100
 *  - null / undefined / "" are all treated as "empty" (equal)
 *  - ObjectId → compare as hex string
 *  - Arrays → element-wise after normalization
 *  - Only fields present in `incomingDoc` are compared
 *    (extra DB fields are ignored — no phantom diffs)
 * ============================================================
 */

// ─── Primitive Normalization ────────────────────────────────

/**
 * Normalize a single scalar value for comparison.
 * Returns a canonical form: string | number | boolean | null
 */
const normalizeScalar = (v) => {
  if (v === null || v === undefined || v === '') return null;

  // BSON ObjectId (from mongoose lean())
  if (typeof v === 'object' && v !== null && typeof v.toHexString === 'function') {
    return v.toHexString();
  }
  // Generic object with a toString that yields a hex-like string (fallback for ObjectId)
  if (typeof v === 'object' && v !== null && v._bsontype === 'ObjectId') {
    return v.toString();
  }

  // Numeric string coercion: "100" → 100
  if (typeof v === 'string') {
    const trimmed = v.trim();
    if (trimmed === '') return null;
    const asNum = Number(trimmed);
    if (!isNaN(asNum) && trimmed !== '') {
      // Only coerce if the string is purely numeric (no letters)
      if (/^-?\d+(\.\d+)?$/.test(trimmed)) return asNum;
    }
    return trimmed;
  }

  if (typeof v === 'number') return v;
  if (typeof v === 'boolean') return v;

  return null; // unknown type → treat as empty
};

/**
 * Normalize an array of values for comparison.
 * Filters out empty elements, normalizes each.
 */
const normalizeArray = (arr) => {
  if (!Array.isArray(arr)) return [];
  return arr
    .map(normalizeScalar)
    .filter((v) => v !== null);
};

/**
 * Deep-equal comparison of two normalized values.
 * Both sides are normalized first.
 */
const isEqual = (incoming, existing) => {
  // Both sides: array?
  const inArr = Array.isArray(incoming);
  const exArr = Array.isArray(existing);

  if (inArr || exArr) {
    const a = normalizeArray(inArr ? incoming : [incoming]);
    const b = normalizeArray(exArr ? existing : [existing]);
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) return false;
    }
    return true;
  }

  // Plain object comparison (for categoryFields)
  if (
    incoming !== null && typeof incoming === 'object' &&
    existing !== null && typeof existing === 'object'
  ) {
    const inKeys = Object.keys(incoming);
    for (const k of inKeys) {
      if (!isEqual(incoming[k], existing[k])) return false;
    }
    return true;
  }

  // Scalar comparison
  const a = normalizeScalar(incoming);
  const b = normalizeScalar(existing);
  return a === b;
};

// ─── Main Diff Function ─────────────────────────────────────

/**
 * Compare a proposed update document against the existing DB document.
 *
 * @param {Object} incomingDoc  - Fields we want to set (from the sheet row)
 * @param {Object|null} existingDoc - The current DB document (.lean())
 * @param {Object} [options]
 * @param {boolean} [options.debug] - Emit field-level diff details
 * @returns {{ isNew: boolean, hasChanges: boolean, changedFields: string[] }}
 */
export const diffDocuments = (incomingDoc, existingDoc, { debug = false } = {}) => {
  if (!existingDoc) {
    return { isNew: true, hasChanges: true, changedFields: [] };
  }

  const changedFields = [];

  for (const field of Object.keys(incomingDoc)) {
    const incomingVal = incomingDoc[field];
    const existingVal = existingDoc[field];

    if (!isEqual(incomingVal, existingVal)) {
      changedFields.push(field);

      if (debug) {
        const normIn = Array.isArray(incomingVal)
          ? normalizeArray(incomingVal)
          : normalizeScalar(incomingVal);
        const normEx = Array.isArray(existingVal)
          ? normalizeArray(existingVal)
          : normalizeScalar(existingVal);
        console.log(
          `[DIFF] field="${field}"  incoming=${JSON.stringify(normIn)}  existing=${JSON.stringify(normEx)}`
        );
      }
    }
  }

  return {
    isNew: false,
    hasChanges: changedFields.length > 0,
    changedFields,
  };
};
