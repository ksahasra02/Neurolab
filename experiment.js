// ===============================
// GET EXPERIMENT SCREENS
// ===============================

const instructionScreen = document.querySelector(".instruction-screen");
const fixationScreen = document.querySelector(".fixation-screen");
const stimulusScreen = document.querySelector(".stimulus-screen");
const responseScreen = document.querySelector(".response-screen");
const completionScreen = document.querySelector(".completion-screen");


// ===============================
// GET BUTTON
// ===============================

const beginButton = document.querySelector(".begin-button");


// ===============================
// VARIABLES
// ===============================

let stimulusStartTime = 0;
let reactionTime = 0;


// ===============================
// SHOW ONE SCREEN
// ===============================

function showScreen(screen) {

    document.querySelectorAll(".experiment-screen").forEach((item) => {
        item.classList.remove("active");
    });

    screen.classList.add("active");
}


// ===============================
// BEGIN EXPERIMENT
// ===============================

beginButton.addEventListener("click", () => {

    // Show fixation
    showScreen(fixationScreen);

    // Wait 1 second
    setTimeout(() => {

        // Show stimulus
        showScreen(stimulusScreen);

        // Start reaction-time timer
        stimulusStartTime = performance.now();

    }, 1000);

});


// ===============================
// DETECT SPACE KEY
// ===============================

document.addEventListener("keydown", (event) => {

    // Only respond when stimulus is visible
    if (!stimulusScreen.classList.contains("active")) {
        return;
    }

    // Check if SPACE was pressed
    if (event.code === "Space") {

        // Calculate reaction time
        reactionTime = performance.now() - stimulusStartTime;

        // Display result
        document.querySelector(".response-content h1").innerHTML =
            `${Math.round(reactionTime)} <span>ms</span>`;

        // Show response screen
        showScreen(responseScreen);

    }

});
// ===============================
// CONTINUE AFTER RESPONSE
// ===============================

document.addEventListener("keydown", (event) => {

    // Only continue when response screen is visible
    if (!responseScreen.classList.contains("active")) {
        return;
    }

    // Check SPACE key
    if (event.code === "Space") {

        // For now, finish the experiment
        showScreen(completionScreen);

    }

});