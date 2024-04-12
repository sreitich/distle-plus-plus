/*
 * Words Source: https://github.com/pkLazer/password_rank/blob/master/4000-most-common-english-words-csv.csv
 *
 * Note: Swear words, hyphenated words, and suggestive words have been manually parsed out.
 */

const WORDS_FILE_PATH = "/words.txt"

export async function getWords() {
  const response = await fetch(WORDS_FILE_PATH)
  const content = await response.text()
  return content.split('\r\n')
}

export async function getRandomWord() {
  let random_word = ""

  await getWords().then((words) => {
    if (words.length > 0)
    {
      random_word = words[Math.floor(Math.random() * words.length)]
    }
    else
    {
      console.error('Error retrieving random word.')
    }
  })

  return random_word.toLowerCase()
}