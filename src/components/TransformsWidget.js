import React from 'react'

const transformLinks = {
    "X": require("../assets/Feedback_Correct.png"),
    "D": require("../assets/Feedback_Delete.png"),
    "I": require("../assets/Feedback_Insert.png"),
    "R": require("../assets/Feedback_Replace.png"),
    "T": require("../assets/Feedback_Transpose.png")
}

export default function TransformWidget({ transformString })
{
    const transformArr = [...transformString]

    return (
        <div className="transforms">
            {transformArr.map((transform, i) => <img src={transformLinks[transform]} alt={transform} key={i}></img>)}
        </div>
    );
}