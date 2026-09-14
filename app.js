let selectedDocument = null;
let selectedVote = null;
let cameraStream = null;

const parties = [
  "Party A",
  "Party B",
  "Party C"
];


/* SCREEN */

function showScreen(screenId) {

  document
    .querySelectorAll(".screen")
    .forEach(screen => {

      screen.classList.remove("active");

    });

  document
    .getElementById(screenId)
    .classList.add("active");


  if (screenId !== "face") {

    stopCamera();

  }

}


/* START */

function startVoting() {

  const voted =
    localStorage.getItem("votechain_voted");


  if (voted === "true") {

    alert(
      "This browser has already submitted a demo vote."
    );

    openResults();

    return;

  }


  showScreen("verify");

}


/* DOCUMENT */

function selectDocument(name, element) {

  selectedDocument = name;


  document
    .querySelectorAll("#verify .option")
    .forEach(option => {

      option.classList.remove("selected");

    });


  element.classList.add("selected");

}


function continueIdentity() {

  if (!selectedDocument) {

    alert("Please select an identity document.");

    return;

  }


  showScreen("face");

}


/* CAMERA */

async function startCamera() {

  const status =
    document.getElementById("livenessStatus");


  try {

    status.innerText =
      "Requesting camera permission...";


    cameraStream =
      await navigator.mediaDevices.getUserMedia({

        video: {
          facingMode: "user"
        },

        audio: false

      });


    const camera =
      document.getElementById("camera");


    camera.srcObject = cameraStream;

    camera.style.display = "block";


    document
      .getElementById("cameraPlaceholder")
      .style.display = "none";


    document
      .getElementById("cameraButton")
      .classList.add("hidden");


    document
      .getElementById("livenessButton")
      .classList.remove("hidden");


    status.innerText =
      "✓ Camera ready. Complete liveness verification.";

  }

  catch (error) {

    console.error(error);

    status.innerText =
      "❌ Camera access denied or unavailable.";

  }

}


function stopCamera() {

  if (cameraStream) {

    cameraStream
      .getTracks()
      .forEach(track => track.stop());

    cameraStream = null;

  }

}


/* LIVENESS */

function completeLiveness() {

  document
    .getElementById("livenessStatus")
    .innerText =
    "✓ Liveness verification complete!";


  setTimeout(() => {

    showScreen("vote");

  }, 700);

}


/* SELECT VOTE */

function selectVote(party, element) {

  selectedVote = party;


  document
    .querySelectorAll(".vote-option")
    .forEach(option => {

      option.classList.remove("selected");

    });


  element.classList.add("selected");

}


/* REVIEW */

function reviewVote() {

  if (!selectedVote) {

    alert("Please select a party.");

    return;

  }


  document
    .getElementById("confirmParty")
    .innerText =
    selectedVote;


  showScreen("confirm");

}


/* CONFIRM */

function confirmVote() {

  if (
    localStorage.getItem("votechain_voted") ===
    "true"
  ) {

    alert("This browser has already voted.");

    return;

  }


  let results =
    JSON.parse(
      localStorage.getItem("votechain_results")
    );


  if (!results) {

    results = {
      "Party A": 0,
      "Party B": 0,
      "Party C": 0
    };

  }


  results[selectedVote]++;


  localStorage.setItem(
    "votechain_results",
    JSON.stringify(results)
  );


  localStorage.setItem(
    "votechain_voted",
    "true"
  );


  const receipt =
    createReceipt();


  document
    .getElementById("receiptId")
    .innerText =
    receipt;


  showScreen("success");

}


/* RECEIPT */

function createReceipt() {

  const random =
    Math.random()
      .toString(36)
      .substring(2, 8)
      .toUpperCase();


  return "VC-" + random;

}


/* RESULTS */

function openResults() {

  showScreen("results");

  renderResults();

}


function renderResults() {

  let results =
    JSON.parse(
      localStorage.getItem("votechain_results")
    );


  if (!results) {

    results = {
      "Party A": 0,
      "Party B": 0,
      "Party C": 0
    };

  }


  const total =
    parties.reduce(
      (sum, party) =>
        sum + results[party],
      0
    );


  document
    .getElementById("totalVotes")
    .innerText =
    total;


  let html = "";


  parties.forEach(party => {

    const votes =
      results[party];


    const percentage =
      total > 0
        ? Math.round(
            (votes / total) * 100
          )
        : 0;


    html += `

      <div class="result-card">

        <div class="result-header">

          <strong>${party}</strong>

          <span class="result-votes">
            ${votes} votes · ${percentage}%
          </span>

        </div>

        <div class="progress-bar">

          <div
            class="progress-fill"
            style="width:${percentage}%">

          </div>

        </div>

      </div>

    `;

  });


  document
    .getElementById("resultsList")
    .innerHTML =
    html;


  showWinner(results, total);

}


function showWinner(results, total) {

  const winnerText =
    document.getElementById("winnerText");


  if (total === 0) {

    winnerText.innerText =
      "No votes yet.";

    return;

  }


  let winner = parties[0];


  parties.forEach(party => {

    if (
      results[party] >
      results[winner]
    ) {

      winner = party;

    }

  });


  winnerText.innerText =
    "🏆 Current Leader: " + winner;

}


/* RESET */

function resetDemo() {

  const reset =
    confirm(
      "Reset all demo votes and results?"
    );


  if (!reset) return;


  localStorage.removeItem(
    "votechain_results"
  );

  localStorage.removeItem(
    "votechain_voted"
  );


  selectedVote = null;
  selectedDocument = null;


  renderResults();

}


/* LOADER */

window.addEventListener("load", () => {

  setTimeout(() => {

    document
      .getElementById("loader")
      .classList.add("loader-hide");

  }, 1500);

});
