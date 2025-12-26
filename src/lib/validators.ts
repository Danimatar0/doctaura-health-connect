/**
 * Common validation patterns and utilities for form validation
 */

// Regex patterns
export const VALIDATION_PATTERNS = {
  /** Letters only (a-z, A-Z) with spaces allowed */
  lettersOnly: /^[a-zA-Z\s]+$/,

  /** Alphanumeric only (a-z, A-Z, 0-9) - no spaces or special characters */
  alphanumeric: /^[a-zA-Z0-9]+$/,

  /** Alphanumeric with spaces allowed */
  alphanumericWithSpaces: /^[a-zA-Z0-9\s]+$/,

  /** International phone number format */
  phoneNumber: /^\+?[1-9]\d{6,16}$/,

  /** Email format (basic) */
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
} as const;

// Error messages
export const VALIDATION_MESSAGES = {
  lettersOnly: "can only contain letters",
  alphanumeric: "can only contain letters and numbers",
  alphanumericWithSpaces: "can only contain letters, numbers, and spaces",
  phoneNumber: "Please enter a valid phone number",
  email: "Please enter a valid email address",
} as const;

/**
 * Creates a validation message for a specific field
 */
export const createValidationMessage = (
  fieldName: string,
  validationType: keyof typeof VALIDATION_MESSAGES
): string => {
  return `${fieldName} ${VALIDATION_MESSAGES[validationType]}`;
};
