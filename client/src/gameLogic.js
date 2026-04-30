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
  const digits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  let secret = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * digits.length);
    secret += digits.splice(randomIndex, 1)[0];
  }
  return secret;
}

export const DIFFICULTIES = {
  Easy: { tries: 5, digits: 3, multiplier: 1.0 },
  Normal: { tries: 4, digits: 4, multiplier: 1.5 },
  Hard: { tries: 3, digits: 4, multiplier: 2.5 },
  Extreme: { tries: 3, digits: 5, multiplier: 4.0 },
};
