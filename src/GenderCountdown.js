import React from "react";
import "./countdown.css";
import { useState } from "react";

export const GenderCountdown = () => {
  // const [revealMessage, setRevealMessage] = useState("");

  let countdown;

  const startTimer = (duration, gender) => {
    let timer;
    timer = duration;
    let seconds;

    countdown = setInterval(function () {
      seconds = parseInt(timer % 60, 10);

      const display = document.querySelector("#counter");
      document.querySelector("#start").style.display = "none";
      display.textContent = seconds;

      if (--timer < 0) {
        timer = duration;
        clearInterval(countdown);
        display.style.display = "none";

        const docBody = document.querySelector("body");
        if (gender === "girl") {
          docBody.style.backgroundImage =
            "url('https://media4.giphy.com/media/K9MPm9A3CaSkw/200w.gif?cid=82a1493bjmbf74sqgxnb4emr4hse65xczf57gkrrmgqtzfm7&rid=200w.gif&ct=g')";
          docBody.style.color = "#ff627e";
          docBody.style.textShadow = "8px 1px black";
        } else {
          docBody.style.backgroundImage =
            "url('https://media4.giphy.com/media/liFaAWEOa1uKc/200w.gif?cid=82a1493bnm84hi1bbod5eoxmgpk5jc1dcfrs8e0ueraxj26f&rid=200w.gif&ct=g')";
          docBody.style.color = "cornflowerblue";
          docBody.style.textShadow = "8px 1px black";
        }

        const genderText = gender === "girl" ? "IT'S A GIRL!" : "IT'S A BOY!";
        document.querySelector("#gender").textContent = genderText;
      }
    }, 1000);
  };

  return (
    <>
      <button
        onClick={() => {
          startTimer(10, "girl");
        }}
        id="start"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          height="24"
          viewBox="0 0 24 24"
          width="24"
        >
          <path d="M0 0h24v24H0z" fill="none" />
          <path d="M10 16.5l6-4.5-6-4.5v9zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
        </svg>
      </button>
      <div id="counter"></div>
      <div id="gender"></div>
    </>
  );
};

export default GenderCountdown;
