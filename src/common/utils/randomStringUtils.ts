/**
 * Generates a random alphanumeric string of given length.
 * Excludes special characters.
 * @returns Randomly generated string
 */
export const generateRandomString = (charset: string): string => {
  return Array.from({ length: charset.length }, () => charset.charAt(Math.floor(Math.random() * charset.length))).join(
    ''
  );
};
