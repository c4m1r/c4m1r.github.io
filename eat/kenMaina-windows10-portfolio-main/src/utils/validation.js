/**
 * Form Validation Utilities
 * Provides reusable validators for common form fields
 */

export const validators = {
  /**
   * Validate email format
   * @param {string} value - Email to validate
   * @returns {boolean}
   */
  email: (value) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(value);
  },
  
  /**
   * Validate required field (not empty)
   * @param {string} value - Value to validate
   * @returns {boolean}
   */
  required: (value) => value && value.trim().length > 0,
  
  /**
   * Validate minimum length
   * @param {number} min - Minimum length
   * @returns {function}
   */
  minLength: (min) => (value) => value.length >= min,
  
  /**
   * Validate maximum length
   * @param {number} max - Maximum length
   * @returns {function}
   */
  maxLength: (max) => (value) => value.length <= max,
  
  /**
   * Validate phone number
   * @param {string} value - Phone number to validate
   * @returns {boolean}
   */
  phone: (value) => {
    const regex = /^[\d\s\-\+\(\)]+$/;
    return regex.test(value) && value.length >= 10;
  },
  
  /**
   * Validate URL format
   * @param {string} value - URL to validate
   * @returns {boolean}
   */
  url: (value) => {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  },
  
  /**
   * Validate password strength
   * Requires: 1 uppercase, 1 lowercase, 1 number, 1 special char, min 8 chars
   * @param {string} value - Password to validate
   * @returns {boolean}
   */
  password: (value) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(value);
  },
  
  /**
   * Validate alphanumeric only
   * @param {string} value - Value to validate
   * @returns {boolean}
   */
  alphanumeric: (value) => /^[a-zA-Z0-9]+$/.test(value),
  
  /**
   * Validate numeric only
   * @param {string} value - Value to validate
   * @returns {boolean}
   */
  numeric: (value) => /^\d+$/.test(value),
  
  /**
   * Validate matches pattern
   * @param {RegExp} pattern - Regex pattern to match
   * @returns {function}
   */
  pattern: (pattern) => (value) => pattern.test(value),
};

/**
 * Get user-friendly validation message
 * @param {string} field - Field name
 * @param {string} rule - Validation rule name
 * @param {object} params - Additional parameters
 * @returns {string}
 */
export const getValidationMessage = (field, rule, params = {}) => {
  const messages = {
    email: `${field} must be a valid email address`,
    required: `${field} is required`,
    minLength: `${field} must be at least ${params.min || 1} characters`,
    maxLength: `${field} must not exceed ${params.max || 100} characters`,
    phone: `${field} must be a valid phone number`,
    url: `${field} must be a valid URL`,
    password: `${field} must contain uppercase, lowercase, number, special character, and be at least 8 characters`,
    alphanumeric: `${field} can only contain letters and numbers`,
    numeric: `${field} can only contain numbers`,
    pattern: `${field} format is invalid`,
  };
  
  return messages[rule] || 'Invalid input';
};

/**
 * Combine multiple validators
 * @param {array} rules - Array of validator functions or names
 * @returns {function}
 */
export const combine = (rules) => (value) => {
  return rules.every(rule => {
    if (typeof rule === 'function') {
      return rule(value);
    }
    return validators[rule]?.(value) ?? true;
  });
};

/**
 * Create custom validator
 * @param {function} validatorFn - Custom validation function
 * @param {string} message - Error message
 * @returns {object}
 */
export const customValidator = (validatorFn, message) => ({
  validate: validatorFn,
  message,
});

export default {
  validators,
  getValidationMessage,
  combine,
  customValidator,
};
