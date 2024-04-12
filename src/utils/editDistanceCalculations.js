export function getTransforms(word1, word2) {
  return getTransformsFromTable(word1, word2, getEditDistanceTable(word1, word2))
}

function getEditDistanceTable(word1, word2) {
  const word1Len = word1.length;
  const word2Len = word2.length;

  // Initialize a distance table using the size of the words.
  let initRow = []
  let distTable = []
  for (let i = 0; i < word1Len + 1; i++)
    initRow.push(0)
  for (let j = 0; j < word2Len + 1; j++)
    distTable.push(JSON.parse(JSON.stringify(initRow)));

  // Initialize the gutters with the length of the substrings.
  for (let i = 0; i < word1Len + 1; i++)
    distTable[0][i] = i;
  for (let j = 0; j < word2Len + 1; j++)
    distTable[j][0] = j

  // Iterate through each cell in a bottom-up pattern, skipping the gutters.
  for (let i = 1; i < word1Len + 1; i++)
  {
    for (let j = 1; j < word2Len + 1; j++)
    {
      // If the letters match, take the cost of the cell up and to the left of this cell.
      if (word1[i - 1] === word2[j - 1])
        distTable[j][i] = distTable[j - 1][i - 1]; // try switching i and j

      /* If the letters don't match, take the minimum of the cells above, left, and diagonally up-left, adding 1
       * to the edit distance. This performs a deletion, insertion, and replacement to see which is most effective. */
      else
        distTable[j][i] = Math.min(distTable[j][i - 1] + 1,distTable[j - 1][i] + 1, distTable[j - 1][i - 1] + 1);

      /* Check if we can use transposition. This is only an option if the previous letter from word2 matches the
       * current letter from word1 and the previous letter from word1 matches the current letter from word2. I.e. two
       * adjacent letters in word1 and word2 match but are reversed. */
      if (i > 1 && j > 1 && word1[i - 1] === word2[j - 2] && word1[i - 2] === word2[j - 1])
        /* If transposition is an option, check if it is a better option than the insertion, deletion, or replacement
         * we've already checked. */
        distTable[j][i] = Math.min(distTable[j][i], distTable[j - 2][i - 2] + 1);
    }
  }

  return distTable
}

function getTransformsFromTable(word1, word2, table)
{
  // Cache the length of the two strings (we'll be writing them A LOT)
  const i = word1.length;
  const j = word2.length;

  // Base case: We reach the first cell where we compare two empty strings.
  if (i === 0 && j === 0)
  {
    return [];
  }

  // Replacement: This cell took the cell to its upper left and added 1.
  if (i > 0 && j > 0 && table[j][i] === table[j - 1][i - 1] + 1)
  {
    return ["R"] + getTransformsFromTable(word1.substring(0, i - 1), word2.substring(0, j - 1), table);
  }

  /* Transposition: This cell took the cell to its upper left, two units, and added 1. Ensure that this cell and its
   * adjacent cells are actually valid for transpositions too, to avoid edge cases where a matching letter and a
   * replacement make a cell look like a transposition (see test 11). */
  if (i > 1 && j > 1 && word1[i - 1] === word2[j - 2] && word1[i - 2] === word2[j - 1] && table[j][i] === table[j - 2][i - 2] + 1)
  {
    return ["T"] + getTransformsFromTable(word1.substring(0, i - 2), word2.substring(0, j - 2), table);
  }

  // Insertion: This cell took the cell above it and added 1.
  if (j > 0 && table[j][i] === table[j - 1][i] + 1)
  {
    return ["I"] + getTransformsFromTable(word1, word2.substring(0, j - 1), table)
  }

  // Deletion: This cell took the cell to its left and added 1.
  if (i > 0 && table[j][i] === table[j][i - 1] + 1)
  {
    return ["D"] + getTransformsFromTable(word1.substring(0, i - 1), word2, table)
  }

  // No action: The letters at the cell's index match.
  if (i > 0 && j > 0 && table[j][i] === table[j - 1][i - 1])
  {
    return ["X"] + getTransformsFromTable(word1.substring(0, i - 1), word2.substring(0, j - 1), table)
  }

  // Safety net. The way that the table is constructed, at least one of the above conditions should ALWAYS be met.
  return []
}