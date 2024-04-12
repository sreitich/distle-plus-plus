// This web app's API key for Webster's "dictionary" service.
const KEY_DICTIONARY = "1a3ffdde-edd4-44de-84d5-a9ec25e4eeab"

// Returns the most common definition of the given word using the Marrian-Webster's API.
export async function getWordDef(word) {
  const wordLower = word.toLowerCase();
  const url = `https://www.dictionaryapi.com/api/v3/references/collegiate/json/${wordLower}?key=${KEY_DICTIONARY}`

  /*
   * This API call uses Webster's Collegiate Dictionary API: https://dictionaryapi.com/products/api-collegiate-dictionary
   *
   * The JSON data is a collection of information regarding the given word. The first element in this collection
   * (data[0]) is definition data for the word. This data has an attribute, shortdef, which is an array of shortened
   * definitions for the word, in order of how common each of those definitions are.
   */

  let def = "";

  let dictRequest = await fetch(url, {
    method: 'GET'
  })
    .then(response => response.json())
    .then(data => { def = data[0].shortdef[0]; })
    .catch(() => { def = ""; }) // Return nothing if there was a problem with the API call.

  return def;
}