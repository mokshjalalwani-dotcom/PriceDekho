/**
 * In-memory cache middleware (no-op passthrough).
 * Redis was removed during cleanup. This stub keeps route signatures intact
 * so adding Redis/Valkey back later is a one-file change.
 */
export const cache = (_durationSeconds) => {
  return (_req, _res, next) => next();
};
