import { useState } from "react";

const VALID_CHARS = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z']
const MAX_GUESS_LENGTH = 14;
export const guessValidityEnum = {
  // The guess is valid.
  VALID: 1,
  // The guess is too long.
  INVALID_LONG: 2,
  // The guess has invalid characters.
  INVALID_CHAR: 3
}

// Processes the given word as a guess, returning an enum of whether or not the guess is valid.
function processGuess(guess)
{
  // Ensure the guess does not exceed the maximum length.
  if (guess.length > MAX_GUESS_LENGTH || guess.length < 1)
  {
    return guessValidityEnum.INVALID_LONG;
  }

  // Ensure the guess does not include any numbers, spaces, or special characters.
  const guessLower = guess.toLowerCase();
  for (const letter of guessLower)
  {
    if (!VALID_CHARS.includes(letter))
    {
      return guessValidityEnum.INVALID_CHAR;
    }
  }

  // If the guess passes all the checks, it's valid.
  return guessValidityEnum.VALID;
}

export default function GuessField({ onGuess }) {
  const [content, setContent] = useState("");

  function submit(e) {
    e.preventDefault();

    // Process the validity of the guess.
    const contentLower = content.toLowerCase();
    const validity = processGuess(contentLower);
    onGuess(validity, contentLower);

    // Clear the guess field if the user made a valid guess.
    if (validity === guessValidityEnum.VALID)
    {
      setContent("");
    }
  }

  return (
    <form onSubmit={submit}>
      <input className="guess-field-prop" value={content} maxLength="14" onChange={(e) => setContent(e.target.value)}/>
    </form>
  );
}
