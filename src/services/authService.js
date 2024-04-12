import { useState, useEffect } from "react"
import { signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth"
import { auth } from "./firebaseConfig"
import { gameStateEnum } from '../components/App'

// Collection of user IDs that should be considered administrators.
const ADMIN_UIDS = ["WnD7j8weh6WXHGQejDQPiFpQsqk2"]

export function SignIn() {
  return <button onClick={() => signInWithPopup(auth, new GoogleAuthProvider())}>Sign In to Play</button>
}

export function SignOut(resetGame, setGameState) {
  return (
    <div className="sign-out">
      Hello, {auth.currentUser.displayName} &nbsp;
      <button onClick={() => {
        // Reset game data (effectively quitting the game).
        resetGame();
        // Return to the menu.
        setGameState(gameStateEnum.MENU);
        // Sign out.
        signOut(auth);
      }}>Sign Out</button>
    </div>
  )
}

export function useAuthentication() {
  const [user, setUser] = useState(null)

  useEffect(() => {
    return auth.onAuthStateChanged((user) => {
      user ? setUser(user) : setUser(null)
    })
  }, [])

  return user
}

// Checks if the currently signed-in user has administrator authority.
export function userHasAuthority()
{
  if (!auth)
  {
    return false;
  }

  // Check if our front-end admin user ID list contains the current user before telling them they have authority.
  return ADMIN_UIDS.includes(auth.currentUser.uid);
}