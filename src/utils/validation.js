/**
 * Simple request validation helpers (MVP-level).
 * Returns first error message or null if valid.
 */
function required(body, fields) {
  const b = body || {};
  for (const field of fields) {
    const value = b[field];
    if (value === undefined || value === null || value === '') {
      return `${field} is required`;
    }
  }
  return null;
}

function oneOf(value, allowed) {
  if (!allowed.includes(value)) {
    return `${value} is not one of: ${allowed.join(', ')}`;
  }
  return null;
}

module.exports = { required, oneOf };
