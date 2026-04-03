export function evaluateGuess(guessStr, secretStr) {
  const result = Array(guessStr.length).fill('gray');
  const secretChars = secretStr.split('');
  const guessChars = guessStr.split('');

  // First pass: mark greens
  for (let i = 0; i < guessChars.length; i++) {
    if (guessChars[i] === secretChars[i]) {
      result[i] = 'green';
      secretChars[i] = null; // consume this character from secret
      guessChars[i] = null;  // consume this character from guess
    }
  }

  // Second pass: mark yellows
  for (let i = 0; i < guessChars.length; i++) {
    if (guessChars[i] !== null) {
      const matchIndex = secretChars.indexOf(guessChars[i]);
      if (matchIndex !== -1) {
        result[i] = 'yellow';
        secretChars[matchIndex] = null; // consume
      }
    }
  }

  return result;
}

export function generateSecret(length) {
  let secret = '';
  for (let i = 0; i < length; i++) {
    let digit = Math.floor(Math.random() * 10).toString();
    if (secret.includes(digit) && Math.random() < 0.8) {
      digit = Math.floor(Math.random() * 10).toString();
    }
    secret += digit;
  }
  return secret;
}

export const DIFFICULTIES = {
  Easy: { tries: 5, digits: 3, multiplier: 1.0 },
  Normal: { tries: 4, digits: 4, multiplier: 1.5 },
  Hard: { tries: 3, digits: 4, multiplier: 2.5 },
  Extreme: { tries: 3, digits: 5, multiplier: 4.0 },
};
