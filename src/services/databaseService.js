import { auth, db } from './firebaseConfig'
import { addDoc, collection, deleteDoc, doc, getDocs, limit, query, Timestamp } from "firebase/firestore"

const LEADERBOARD_SIZE = 10

/*
 * Tries to add the current user to the leaderboard with the given score. If the given score is not high enough to be
 * on the leaderboard, nothing happens. If the given score ties another score on the leaderboard, the older score takes
 * priority and is not replaced.
 */
export async function tryAddScoreToLeaderboard(score) {
  if (!auth || !auth.currentUser) {
    return;
  }

  const userId = auth.currentUser.uid;
  const userName = auth.currentUser.displayName;

  const data = { username: userName, user_id: userId, score, date: Timestamp.now() }

  // Retrieve the current leaderboard to check if we beat any scores.
  let leaderboardEntries = await fetchLeaderboard();

  /* Check if the player already has a high score. If they do, only add a new high score if they beat their previous
   * score. This means that each player can only have one score on the leaderboard, and it will always be their
   * highest. */
  let currentScoreIndex = -1;
  for (const i in leaderboardEntries) {
    if (leaderboardEntries[i].user_id === userId) {
      currentScoreIndex = i;
      break;
    }
  }

  // Check if our current score beat any score in the leaderboard.
  let beatenScoreIndex = -1;
  for (const i in leaderboardEntries)
  {
    // We don't really care if we beat a score that's outside the visible leaderboard.
    if (i > LEADERBOARD_SIZE)
    {
     return;
    }

    if (score > leaderboardEntries[i].score)
    {
      beatenScoreIndex = i;
      break;
    }
  }

  // If we beat a score on the leaderboard, try to insert our new score in that position.
  if (beatenScoreIndex > -1)
  {
    /* If we already have a score on the leaderboard, only add a new score if we beat our old one, and then delete our
     * old score. */
    if (currentScoreIndex > -1)
    {
      if (score > leaderboardEntries[currentScoreIndex].score)
      {
        const deletedDocRef = await deleteDoc(doc(db, 'leaderboard', leaderboardEntries[currentScoreIndex].id));
      }
      else
      {
        return null;
      }
    }

    const newDocRef = await addDoc(collection(db, "leaderboard"), data);
    return { id: newDocRef.id, ...data }
  }

  return null;
}

/* Returns the entire leaderboard database from highest to lowest score, with older scores breaking ties. The
 * leaderboard only contains LEADERBOARD_SIZE items at any time.ff
 */
export async function fetchLeaderboard() {
  const snapshot = await getDocs(
    query(collection(db, "leaderboard"))
  )

  // An array of leaderboard entries, with each entry including a date, username, user ID, and score, sorted by score.
  let leaderboardData = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  // Sort the leaderboard by score, breaking ties with the entry date.
  leaderboardData.sort(function(entry1, entry2) {
    return entry1.score === entry2.score ? entry1.date - entry2.date : entry2.score - entry1.score;
  });

  // Limit the data to only the top LEADERBOARD_SIZE scores.
  leaderboardData = leaderboardData.splice(0, LEADERBOARD_SIZE);

  return leaderboardData;
}