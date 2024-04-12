import React from 'react'

// Pop-up displayed when "Leaderboard" is clicked.
export default function LeaderboardPopUp({ trigger, onClose, leaderboardMap })
{
  return (trigger) ? (
    <div className="lb-popup">
      <div className="lb-popup-box">
        <span className="lb-title">Leaderboard</span>
        <button className="lb-close-popup-button" onClick={onClose}>X</button>
        <div className="lb-text-box">
          {
            leaderboardMap.length > 0 ?
              leaderboardMap.map(([usernameVal, scoreVal], i) => (
                <div className="leaderboard-entry" key={i}>
                  <span className="username">{usernameVal}</span>
                  <span className="score">{scoreVal}</span>
                </div>)) :
              <div className="lb-loading">
                Loading leaderboard...
              </div>
          }
        </div>
      </div>
    </div>
  ) : "";
}