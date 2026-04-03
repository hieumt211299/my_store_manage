/**
 * String utility functions for formatting and transforming text
 */

/**
 * Converts a string to title case (first letter of each word capitalized)
 * @param {string} str - The string to convert
 * @returns {string} - The title case string
 */
export const toTitleCase = (str) => {
  if (!str) return '';
  return String(str)
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Capitalizes the first letter of a string
 * @param {string} str - The string to capitalize
 * @returns {string} - The capitalized string
 */
export const capitalize = (str) => {
  if (!str) return '';
  return String(str).charAt(0).toUpperCase() + String(str).slice(1).toLowerCase();
};

/**
 * Converts a string to uppercase
 * @param {string} str - The string to convert
 * @returns {string} - The uppercase string
 */
export const toUpperCase = (str) => {
  if (!str) return '';
  return String(str).toUpperCase();
};

/**
 * Converts a string to lowercase
 * @param {string} str - The string to convert
 * @returns {string} - The lowercase string
 */
export const toLowerCase = (str) => {
  if (!str) return '';
  return String(str).toLowerCase();
};

/**
 * Trims whitespace from a string
 * @param {string} str - The string to trim
 * @returns {string} - The trimmed string
 */
export const trim = (str) => {
  if (!str) return '';
  return String(str).trim();
};