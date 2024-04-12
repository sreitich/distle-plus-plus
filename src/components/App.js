import { useEffect, useState } from 'react'
import { SignIn, SignOut, useAuthentication } from '../services/authService'
import { fetchLeaderboard, tryAddScoreToLeaderboard } from '../services/databaseService'
import { getRandomWord } from '../services/wordsService'
import './App.css';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import { auth } from '../services/firebaseConfig'
import HowToPlayPopUp from './HowToPlayPopUp'
import { getEditDistanceTable, getTransforms, getTransformsFromTable } from '../utils/editDistanceCalculations'
import GuessField, { guessValidityEnum } from './GuessField'
import TransformWidget from "./TransformsWidget";
import { getWordDef } from '../services/dictionaryService'
import LeaderboardPopUp from './LeaderboardPopUp'

const STARTING_LIVES = 10

export const gameStateEnum = {
  MENU: 1,
  IN_GAME: 2,
  POST_GAME: 3
}

export const gameResultEnum = {
  NONE: 1,
  WIN: 2,
  LOSS: 3
}

export default function App() {
  // Lives.
  const [lives, setLives] = useState(STARTING_LIVES);

  // Game states.
  const [gameState, setGameState] = useState(gameStateEnum.MENU);
  const [gameResult, setGameResult] = useState(gameResultEnum.NONE);

  // Conditional displays.
  const [howToPlay, setHowToPlay] = useState(false);
  const [displayLeaderboard, setDisplayLeaderboard] = useState(false);
  const [leaderboardMap, setLeaderboardMap] = useState({});
  const [isLoadingWord, setIsLoadingWord] = useState(false);
  const [isLoadingDef, setIsLoadingDef] = useState(false);
  const [displayedGuessValidity, setDisplayedGuessValidity] = useState(guessValidityEnum.VALID);

  // Guessing.
  const [currentWord, setCurrentWord] = useState("");
  const [wordDef, setWordDef] = useState("");
  const [guessHistory, setGuessHistory] = useState([]); // List of words we've guessed.
  const [currentGuess, setCurrentGuess] = useState(0); // Number of guesses we've made.
  const [viewedGuess, setViewedGuess] = useState(0); // Index of guess being displayed.
  const [transformHistory, setTransformHistory] = useState([]); // Each guess's edit distance transforms.

  const user = useAuthentication();

  useEffect(() => {
    switch (gameState) {
      case gameStateEnum.MENU:
      {
        break;
      }
      case gameStateEnum.IN_GAME:
      {
        setIsLoadingWord((prevState) => ({ ...prevState, prop: true }));
        getRandomWord().then((newWord) => {
          setCurrentWord((prevState) => ({ ...prevState, prop: newWord }));
          setIsLoadingWord(false);
        }).catch(console.error);

        break;
      }
      case gameStateEnum.POST_GAME:
      {
        setIsLoadingDef(true);

        const getDef = async () => {
          return await getWordDef(currentWord.prop);
        }

        getDef().then((def) => {
          if (def !== "")
          {
            setWordDef(def);
            setIsLoadingDef(false);
          }
        });
      }
    }
  }, [gameState])

  useEffect(() => {
    const getLeaderboard = async () => {
      return await fetchLeaderboard();
    }

    if (displayLeaderboard)
    {
      /* Clear the leaderboard map so that it's empty while we retrieve an updated one. This creates an implicit "isLoading"
       * variable. */
      setLeaderboardMap([]);

      // Populate leaderboardMap with a map of usernames corresponding to scores.
      getLeaderboard().then((entries) => {setLeaderboardMap(entries.map((entry, i) => [entry.username, entry.score]))});
    }
  }, [displayLeaderboard])

  /* Called when the user submits a guess, regardless of if it's valid. If it's not valid, the guess will not be
   * processed and the user will be presented with a warning. */
  function submitGuess(validity, guess)
  {
    // Display a warning if the user tried to make an invalid guess (anything except letters).
    if (validity !== guessValidityEnum.VALID)
    {
      setDisplayedGuessValidity(validity);
      return;
    }
    // Remove the "invalid guess" warning if the player submitted a valid guess.
    else
    {
      setDisplayedGuessValidity(guessValidityEnum.VALID);
    }

    // Decrement lives.
    setLives(lives - 1);

    // If the word was guessed, switch to win screen and check if we beat any leaderboard score.
    if (guess === currentWord.prop)
    {
      setGameResult(gameResultEnum.WIN);
      setGameState(gameStateEnum.POST_GAME);

      // Our score is however many lives we had left when we won.
      tryAddScoreToLeaderboard(lives + 1).catch((e) => {console.error("Error trying to contact database: ", e)});

      return;
    }

    // If we are out of lives, display the loss screen.
    if (lives - 1 <= 0)
    {
      setGameResult(gameResultEnum.LOSS);
      setGameState(gameStateEnum.POST_GAME);
      return;
    }

    // Get the guess's edit distance transforms and add them to the transform history.
    const newTransforms = getTransforms(guess, currentWord.prop).split('').reverse().join('');
    let transformHistoryTemp = transformHistory;
    transformHistoryTemp.push((newTransforms));
    setTransformHistory(transformHistoryTemp);

    // Add the new guess to the guess history.
    let guessHistoryTemp = guessHistory;
    guessHistoryTemp.push(guess);
    setGuessHistory(guessHistoryTemp);

    // Increment our number of guesses.
    setCurrentGuess(currentGuess + 1);
  }

  // Attempts to display the next or previous guess. If there is no next or previous guess, nothing happens.
  function tryUpdateDisplayedGuess(forward/* whether to the view the next or previous guess */)
  {
    if (forward)
    {
      // Only display the next guess if there is one.
      if (currentGuess > viewedGuess)
        setViewedGuess(viewedGuess + 1);
    }
    else
    {
      // Only display the previous guess if there is one.
      if (viewedGuess > 0)
        setViewedGuess(viewedGuess - 1);
    }
  }

  // Resets all game data. Does not change the game state.
  function resetGame()
  {
    setLives(STARTING_LIVES);

    setGameResult(gameResultEnum.NONE);

    setHowToPlay(false);
    setIsLoadingWord(false);
    setIsLoadingDef(false);
    setDisplayedGuessValidity(guessValidityEnum.VALID);

    setCurrentWord("");
    setGuessHistory([])
    setCurrentGuess(0);
    setViewedGuess(0);

    setTransformHistory([]);
  }

  return (
    // Nav-bar (header).
    <div className="App">
      {
        // Loading screen while processing word-search requests.
        isLoadingWord ?
        <div className="loading-word-wrapper">
          <div className="loading-word">
            Loading word...
          </div>
        </div> :

        // Render the main page content depending on the current state of the game.
        <div>
          {(() => {
            // Pre-game menu page.
            if (gameState === gameStateEnum.MENU)
            {
              return (
                <div className="menu-page">
                  <div className="title-card">
                    Distle++
                  </div>
                  <div className="menu-widget">
                    <button onClick={() => {setHowToPlay(true)}}>How to Play?</button>
                    {
                      user ?
                        <button onClick={() => {setGameState(gameStateEnum.IN_GAME)}}>Play</button> :
                        <SignIn></SignIn>
                    }
                  </div>
                  <HowToPlayPopUp trigger={howToPlay} onClose={() => {setHowToPlay(false)}}/>
                </div>
              );
            }

            // In-game page.
            else if (gameState === gameStateEnum.IN_GAME)
            {
              return (
                <div className="game-page">
                  {
                    // Display the list of transforms corresponding to the displayed guess unless we're currently guessing our next word.
                    <div className="transforms">
                      <TransformWidget transformString={viewedGuess < currentGuess ? transformHistory[viewedGuess] : ""}/>
                    </div>
                  }
                  <div className="displayed-word">
                    {
                      viewedGuess > 0 ?
                      <button className="previous-guess-button" onClick={() => {
                        setDisplayedGuessValidity(guessValidityEnum.VALID);
                        tryUpdateDisplayedGuess(false);
                      }}>
                        <img
                          src={require("../assets/PrevGuessImg.png")} alt="View Previous Guess" width="50px"></img>
                      </button> :
                      <button className="previous-guess-button"></button> // I don't know how to fill out the grid space when the button is disabled so this is a spacing filler.
                    }
                    {
                      // If we're viewing a previous guess, display that guess.
                      viewedGuess < currentGuess ?
                      <div className="previous-guess">
                        {guessHistory[viewedGuess]}
                      </div> :
                      // Display an input field to make our next guess if we're guessing.
                      <GuessField onGuess={submitGuess}/>
                    }
                    {
                      viewedGuess < currentGuess &&
                      <button className="next-guess-button" onClick={() => {
                        setDisplayedGuessValidity(guessValidityEnum.VALID);
                        tryUpdateDisplayedGuess(true);
                      }}>
                        <img
                          src={require("../assets/NextGuessImg.png")} alt="View Next Guess" width="50px"></img>
                      </button>
                    }
                  </div>
                  <div className="invalid-guess-warning">
                  {
                    displayedGuessValidity !== guessValidityEnum.VALID &&
                      (
                        displayedGuessValidity === guessValidityEnum.INVALID_CHAR ?
                          "Invalid guess! Your guess can only include letters." :
                          "Invalid guess! Your guess must be between 1 and 14 letters long."
                      )
                  }
                  </div>
                </div>
              );
            }

            // Post-game page.
            else if (gameState === gameStateEnum.POST_GAME)
            {
              return (
                <div className="post-game-pop-up">
                  <div className="post-game-pop-up-box">
                    {
                      gameResult === gameResultEnum.NONE ?
                      <div>
                        Uh oh... this screen should never been displayed.
                      </div> :
                        gameResult === gameResultEnum.WIN ?
                          <div>
                            <span className="win-text">You won!</span> The word was <span className="target-word">{currentWord.prop}</span>.
                          </div> :
                          <div>
                            <span className="loss-text">You lost!</span> The word was <span className="target-word">{currentWord.prop}</span>.
                          </div>
                    }
                    <div className="definition">
                      {
                        isLoadingDef ?
                          <div className="loading-def">
                            Loading word definition...
                          </div> :
                          <div>
                            Webster defines "{currentWord.prop}" as: <span className="word-def">{wordDef.trim()}.</span>
                          </div>
                      }
                    </div>
                    <div className="post-game-options">
                      <button onClick={() => {
                        resetGame();
                        // Changing the game state to "in-game" automatically starts a new game.
                        setGameState(gameStateEnum.IN_GAME);
                      }}>Play Again</button>
                      <button onClick={() => {
                        resetGame();
                        // Return to the menu.
                        setGameState(gameStateEnum.MENU);
                      }}>Return to Menu</button>
                    </div>
                  </div>
                </div>
              );
            }
          })()}
        </div>
      }

      {/* Render this last so it's always on top. */}
      <LeaderboardPopUp trigger={displayLeaderboard} onClose={() => {setDisplayLeaderboard(false)}} leaderboardMap={leaderboardMap}/>

      {
        // Render the navigation bar last so that it's on top and over any pop-ups.
        user &&
        <header>
          <div className="nav-bar">
            <div className="info-bar">
              {
                gameState === gameStateEnum.IN_GAME &&
                <button className="quit-button" onClick={() => {
                  resetGame();
                  setGameState(gameStateEnum.MENU);
                }}>Quit</button>
              }
              {
                gameState === gameStateEnum.IN_GAME &&
                <div className={lives > 3 ? "" : lives > 1 ? "low-lives" : "one-life"}>
                  Lives: {lives}
                </div>
              }
            </div>
            <div className="leaderboard-button">
              <button onClick={() => {
                setDisplayLeaderboard(true);
              }}>Leaderboard</button>
            </div>
            {
              SignOut(resetGame, setGameState)
            }
          </div>
        </header>
      }
    </div>
  );
}