import React from 'react'

// Faux-class for displaying an image followed by text. This just keeps the code cleaner.
function HintDescription({ imgSrc, imgAlt, text })
{
  return (
    <div className="htp-hint-description">
      <img src={imgSrc} alt={imgAlt}></img>
      <p>{text}</p>
    </div>
  );
}

// Pop-up displayed when "How to play?" is clicked.
export default function HowToPlayPopUp({ trigger, onClose })
{
  return (trigger) ? (
    <div className="htp-popup">
      <div className="htp-popup-box">
        <button className="htp-close-popup-button" onClick={onClose}>X</button>
        <div className="htp-text-box">
          <p>1. Guess the hidden word.</p>
          <p>2. Receive hints for each letter, from left to right:</p>
          <HintDescription imgSrc={require("../assets/Feedback_Correct_White.png")} imgAlt="Symbol for a letter that is correct." text="A letter is correct."></HintDescription>
          <HintDescription imgSrc={require("../assets/Feedback_Insert_White.png")} imgAlt="Symbol for a letter that needs to be added." text="A letter needs to be added."></HintDescription>
          <HintDescription imgSrc={require("../assets/Feedback_Delete_White.png")} imgAlt="Symbol for a letter that needs to be deleted." text="A letter needs to be deleted."></HintDescription>
          <HintDescription imgSrc={require("../assets/Feedback_Replace_White.png")} imgAlt="Symbol for a letter that needs to be changed." text="A letter needs to be changed."></HintDescription>
          <HintDescription imgSrc={require("../assets/Feedback_Transpose_White.png")} imgAlt="Symbol for two letters that need to be switched." text="Two letters need to be swapped."></HintDescription>
          <p>3. Don't run out of lives!</p>
        </div>
      </div>
    </div>
  ) : "";
}