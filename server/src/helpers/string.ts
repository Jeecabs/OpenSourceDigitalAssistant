"use strict";

const stringFunctions = {
  pnr,
  ucfirst,
  snakeToPascalCase,
  removeAccents,
  removeEndPunctuation,
  random,
};

/**
 * Parse, map (with object) and replace value(s) in a string
 */
function pnr(s: string, obj: { [key: string]: string }) {
  return s.replace(
    new RegExp(Object.keys(obj).join("|"), "gi"),
    (matched) => obj[matched]
  );
}
/**
 * Uppercase for the first letter
 */
function ucfirst(s: string) {
  return s.charAt(0).toUpperCase() + s.substr(1);
}

/**
 * Transform snake_case string to PascalCase
 */
function snakeToPascalCase(s: string) {
  return s
    .split("_")
    .map((chunk) => ucfirst(chunk))
    .join("");
}
/**
 * Random string
 */
function random(n: number) {
  return Math.random().toString(36).slice(-n);
}

/**
 * Remove accents
 */
function removeAccents(s: string) {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

/**
 * Remove end-punctuation
 *
 */
function removeEndPunctuation(s: string) {
  const punctuations = [".", ";", ":", "?", "!"];

  if (punctuations.includes(s[s.length - 1])) {
    return s.substr(0, s.length - 1); // Chops off the last bits of a sentence
  }

  return s;
}

export default stringFunctions;
