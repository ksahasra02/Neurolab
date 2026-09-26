/* =========================================================
   COGNILAB PARTICIPANT EXPERIMENT
   ========================================================= */


/* =========================================================
   1. GET HTML ELEMENTS
========================================================= */

const instructionScreen = document.querySelector(
    ".instruction-screen"
);

const fixationScreen = document.querySelector(
    ".fixation-screen"
);

const stimulusScreen = document.querySelector(
    ".stimulus-screen"
);

const responseScreen = document.querySelector(
    ".response-screen"
);

const completionScreen = document.querySelector(
    ".completion-screen"
);

const stimulus = document.getElementById(
    "stimulus"
);

const beginButton = document.querySelector(
    ".begin-button"
);

const trialCounter = document.querySelector(
    ".progress-area span"
);

const responseTimeDisplay =
    document.querySelector(
        ".response-content h1"
    );

const responseMessage =
    document.querySelector(
        ".response-content p"
    );

const responseContinue =
    document.querySelector(
        ".response-content p:last-child"
    );

const instructionTitle =
    document.querySelector(
        ".instruction-screen h1"
    );

const instructionDescription =
    document.querySelector(
        ".instruction-screen p"
    );

const fixationText =
    document.querySelector(
        ".fixation-screen p"
    );

const stimulusEyebrow =
    document.querySelector(
        ".stimulus-screen .eyebrow"
    );

const stimulusDescription =
    document.querySelector(
        ".stimulus-screen p"
    );


/* =========================================================
   2. DEFAULT EXPERIMENT
========================================================= */

const fallbackExperiment = {

    name: "Reaction Time Study",

    description:
        "Measure participant reaction time to visual stimuli.",

    randomizeTrials: false,

    randomizeStimulus: false,

    trials: [

        {
            id: "trial-1",

            name: "Blue Circle",

            type: "reaction",

            stimulus: "circle",

            description:
                "Press SPACE as quickly as possible when the circle appears.",

            duration: 500,

            delay: 1000,

            responseMethod: "keyboard",

            correctKey: "Space",

            correctNext: null,

            incorrectNext: null
        },

        {
            id: "trial-2",

            name: "Blue Square",

            type: "reaction",

            stimulus: "square",

            description:
                "Press ENTER as quickly as possible when the square appears.",

            duration: 500,

            delay: 1000,

            responseMethod: "keyboard",

            correctKey: "Enter",

            correctNext: null,

            incorrectNext: null
        }

    ]
};


/* =========================================================
   3. LOAD EXPERIMENT FROM LOCAL STORAGE
========================================================= */

let experiment = null;

try {

    const savedExperiment =
        localStorage.getItem(
            "cognilabExperiment"
        );

    if (savedExperiment) {

        experiment =
            JSON.parse(savedExperiment);

    }

} catch (error) {

    console.error(
        "Could not load saved experiment:",
        error
    );

}


if (
    !experiment ||
    !Array.isArray(experiment.trials) ||
    experiment.trials.length === 0
) {

    experiment =
        fallbackExperiment;

}


/* =========================================================
   4. COPY TRIALS
========================================================= */

let trials = experiment.trials.map(
    (trial, index) => {

        return {

            id:
                trial.id ||
                `trial-${index + 1}`,

            name:
                trial.name ||
                `Trial ${index + 1}`,

            type:
                trial.type ||
                "reaction",

            stimulus:
                trial.stimulus ||
                "circle",

            description:
                trial.description ||
                "Respond as quickly as possible.",

            duration:
                Number(trial.duration) || 500,

            delay:
                Number(trial.delay) || 0,

            responseMethod:
                trial.responseMethod ||
                "keyboard",

            correctKey:
                trial.correctKey ||
                "Space",

            correctNext:
                trial.correctNext ?? null,

            incorrectNext:
                trial.incorrectNext ?? null

        };

    }
);


/* =========================================================
   5. RANDOMIZE TRIAL ORDER
========================================================= */

/*
   Important:

   We shuffle the actual trial objects.

   Branching still works because branches point
   to stable trial IDs instead of array indexes.
*/

if (experiment.randomizeTrials) {

    for (
        let i = trials.length - 1;
        i > 0;
        i--
    ) {

        const randomIndex =
            Math.floor(
                Math.random() * (i + 1)
            );

        [
            trials[i],
            trials[randomIndex]
        ] = [
            trials[randomIndex],
            trials[i]
        ];

    }

}


/* =========================================================
   6. RANDOMIZE STIMULUS
========================================================= */

/*
   This changes the visual stimulus only.

   We deliberately DO NOT automatically change
   the correct response key.

   The researcher-defined correct key remains
   the source of truth.
*/

if (experiment.randomizeStimulus) {

    trials = trials.map(
        trial => {

            return {

                ...trial,

                stimulus:
                    Math.random() < 0.5
                        ? "circle"
                        : "square"

            };

        }
    );

}


/* =========================================================
   7. EXPERIMENT STATE
========================================================= */

let currentTrialIndex = 0;

let currentTrial = null;

let stimulusStartTime = 0;

let responseRecorded = false;

let trialTimer = null;

let results = [];

let experimentStarted = false;


/* =========================================================
   8. HELPER FUNCTIONS
========================================================= */


/*
   Show one screen and hide all other screens.
*/

function showScreen(screen) {

    document
        .querySelectorAll(
            ".experiment-screen"
        )
        .forEach(
            screenElement => {

                screenElement.classList.remove(
                    "active"
                );

            }
        );


    screen.classList.add(
        "active"
    );

}


/*
   Update trial counter.
*/

function updateCounter() {

    if (!currentTrial) {

        return;

    }


    trialCounter.textContent =
        `Trial ${String(
            currentTrialIndex + 1
        ).padStart(2, "0")} / ${trials.length}`;

}


/*
   Convert a keyboard code into
   a readable name.
*/

function getKeyName(code) {

    const keyNames = {

        Space: "SPACE",

        Enter: "ENTER",

        ArrowLeft: "LEFT ARROW",

        ArrowRight: "RIGHT ARROW",

        ArrowUp: "UP ARROW",

        ArrowDown: "DOWN ARROW"

    };


    return (
        keyNames[code] ||
        code
    );

}


/*
   Set the visual stimulus.
*/

function setStimulus(type) {

    stimulus.style.width =
        "120px";

    stimulus.style.height =
        "120px";


    if (type === "square") {

        stimulus.style.borderRadius =
            "0";

        stimulus.style.background =
            "#e74c3c";

        stimulus.style.boxShadow =
            "0 0 55px rgba(231, 76, 104, 0.30)";

    } else {

        stimulus.style.borderRadius =
            "50%";

        stimulus.style.background =
            "#4169e1";

        stimulus.style.boxShadow =
            "0 0 55px rgba(65, 105, 225, 0.30)";

    }

}


/*
   Find a trial using its stable ID.
*/

function findTrialIndexById(id) {

    if (
        id === null ||
        id === undefined ||
        id === ""
    ) {

        return -1;

    }


    return trials.findIndex(
        trial =>
            String(trial.id) ===
            String(id)
    );

}


/*
   Decide which trial comes next.
*/

function getNextTrialIndex(correct) {

    if (!currentTrial) {

        return currentTrialIndex + 1;

    }


    const targetId =
        correct
            ? currentTrial.correctNext
            : currentTrial.incorrectNext;


    /*
       No branch configured:
       continue normally.
    */

    if (
        targetId === null ||
        targetId === undefined ||
        targetId === ""
    ) {

        return currentTrialIndex + 1;

    }


    /*
       Branch configured:
       find the trial using its ID.
    */

    const targetIndex =
        findTrialIndexById(targetId);


    /*
       Invalid branch:
       safely continue to next trial.
    */

    if (targetIndex === -1) {

        return currentTrialIndex + 1;

    }


    return targetIndex;

}


/* =========================================================
   9. SHOW INSTRUCTION SCREEN
========================================================= */

function showExperimentInstructions() {

    instructionTitle.textContent =
        "Ready to begin?";


    instructionDescription.textContent =
        experiment.description ||
        "You will see visual stimuli. Respond as quickly and accurately as possible.";


    showScreen(
        instructionScreen
    );

}


/* =========================================================
   10. START A TRIAL
========================================================= */

function startTrial() {

    clearTimeout(trialTimer);


    if (
        currentTrialIndex < 0 ||
        currentTrialIndex >= trials.length
    ) {

        finishExperiment();

        return;

    }


    currentTrial =
        trials[currentTrialIndex];


    responseRecorded = false;

    stimulusStartTime = 0;


    updateCounter();


    /*
       Instruction-type trial
    */

    if (
        currentTrial.type ===
        "instruction"
    ) {

        startInstructionTrial();

        return;

    }


    /*
       Normal trial
    */

    fixationText.textContent =
        "Get ready...";


    showScreen(
        fixationScreen
    );


    const delay =
        Math.max(
            0,
            currentTrial.delay || 0
        );


    trialTimer =
        setTimeout(
            showStimulus,
            delay
        );

}


/* =========================================================
   11. INSTRUCTION TRIAL
========================================================= */

function startInstructionTrial() {

    instructionTitle.textContent =
        currentTrial.name;


    instructionDescription.textContent =
        currentTrial.description ||
        "Read the instructions and continue.";


    beginButton.textContent =
        "Continue →";


    showScreen(
        instructionScreen
    );

}


/* =========================================================
   12. SHOW STIMULUS
========================================================= */

function showStimulus() {

    if (!currentTrial) {

        return;

    }


    responseRecorded = false;


    setStimulus(
        currentTrial.stimulus
    );


    stimulusEyebrow.textContent =
        currentTrial.responseMethod ===
        "mouse"
            ? "CLICK THE STIMULUS"
            : "RESPOND NOW";


    stimulusDescription.textContent =
        currentTrial.description ||
        "Respond as quickly as possible.";


    showScreen(
        stimulusScreen
    );


    /*
       performance.now() gives a
       high-resolution browser timestamp.
    */

    stimulusStartTime =
        performance.now();


    /*
       Stimulus duration.

       If the participant does not respond
       within the configured duration,
       the trial is recorded as a timeout.
    */

    const duration =
        Math.max(
            0,
            currentTrial.duration || 500
        );


    if (duration > 0) {

        trialTimer =
            setTimeout(
                handleTimeout,
                duration
            );

    }

}


/* =========================================================
   13. CHECK KEYBOARD RESPONSE
========================================================= */

function handleKeyboardResponse(event) {

    if (
        !stimulusScreen.classList.contains(
            "active"
        )
    ) {

        return;

    }


    if (responseRecorded) {

        return;

    }


    /*
       For mouse-response trials,
       keyboard presses should not count.
    */

    if (
        currentTrial.responseMethod ===
        "mouse"
    ) {

        return;

    }


    /*
       Prevent browser shortcuts from
       interfering with the experiment.
    */

    event.preventDefault();


    recordResponse(
        event.code,
        "keyboard"
    );

}


/* =========================================================
   14. CHECK MOUSE RESPONSE
========================================================= */

function handleMouseResponse() {

    if (
        !stimulusScreen.classList.contains(
            "active"
        )
    ) {

        return;

    }


    if (responseRecorded) {

        return;

    }


    if (
        currentTrial.responseMethod !==
        "mouse"
    ) {

        return;

    }


    recordResponse(
        "MouseClick",
        "mouse"
    );

}


/* =========================================================
   15. RECORD RESPONSE
========================================================= */

function recordResponse(
    response,
    responseType
) {

    if (responseRecorded) {

        return;

    }


    responseRecorded = true;


    clearTimeout(
        trialTimer
    );


    const reactionTime =
        Math.round(
            performance.now() -
            stimulusStartTime
        );


    let correct = false;


    /*
       Keyboard trial:
       compare pressed key with
       researcher-defined correct key.
    */

    if (
        responseType ===
        "keyboard"
    ) {

        correct =
            response ===
            currentTrial.correctKey;

    }


    /*
       Mouse trials:
       clicking the stimulus counts
       as a correct response.

       This gives the frontend a simple
       mouse-response mode.
    */

    if (
        responseType ===
        "mouse"
    ) {

        correct = true;

    }


    saveTrialResult({

        trial:
            currentTrialIndex + 1,

        trialId:
            currentTrial.id,

        trialName:
            currentTrial.name,

        stimulus:
            currentTrial.stimulus,

        trialType:
            currentTrial.type,

        responseMethod:
            currentTrial.responseMethod,

        correctKey:
            currentTrial.correctKey,

        keyPressed:
            response,

        reactionTime:
            reactionTime,

        correct:
            correct,

        timedOut:
            false

    });


    showResponseScreen(
        reactionTime,
        correct
    );

}


/* =========================================================
   16. HANDLE TIMEOUT
========================================================= */

function handleTimeout() {

    if (responseRecorded) {

        return;

    }


    responseRecorded = true;


    const elapsed =
        Math.round(
            performance.now() -
            stimulusStartTime
        );


    saveTrialResult({

        trial:
            currentTrialIndex + 1,

        trialId:
            currentTrial.id,

        trialName:
            currentTrial.name,

        stimulus:
            currentTrial.stimulus,

        trialType:
            currentTrial.type,

        responseMethod:
            currentTrial.responseMethod,

        correctKey:
            currentTrial.correctKey,

        keyPressed:
            "No response",

        reactionTime:
            null,

        elapsedBeforeTimeout:
            elapsed,

        correct:
            false,

        timedOut:
            true

    });


    showResponseScreen(
        null,
        false,
        true
    );

}


/* =========================================================
   17. SAVE TRIAL RESULT
========================================================= */

function saveTrialResult(result) {

    results.push(
        result
    );

}


/* =========================================================
   18. SHOW RESPONSE SCREEN
========================================================= */

function showResponseScreen(
    reactionTime,
    correct,
    timedOut = false
) {

    if (timedOut) {

        responseTimeDisplay.innerHTML =
            `— <span>ms</span>`;

        responseMessage.textContent =
            "No response was recorded.";

        responseContinue.textContent =
            "Press SPACE to continue";

    } else {

        responseTimeDisplay.innerHTML =
            `${reactionTime} <span>ms</span>`;


        responseMessage.textContent =
            correct
                ? "Correct response recorded."
                : "Incorrect response recorded.";


        responseContinue.textContent =
            correct
                ? "Press SPACE to continue"
                : "Press SPACE to continue";

    }


    showScreen(
        responseScreen
    );

}


/* =========================================================
   19. CONTINUE AFTER RESPONSE
========================================================= */

function continueAfterResponse() {

    if (
        !responseScreen.classList.contains(
            "active"
        )
    ) {

        return;

    }


    const latestResult =
        results[
            results.length - 1
        ];


    if (!latestResult) {

        return;

    }


    const nextIndex =
        getNextTrialIndex(
            latestResult.correct
        );


    /*
       No more trials.
    */

    if (
        nextIndex < 0 ||
        nextIndex >= trials.length
    ) {

        finishExperiment();

        return;

    }


    currentTrialIndex =
        nextIndex;


    startTrial();

}


/* =========================================================
   20. SAVE FINAL RESULTS
========================================================= */

function finishExperiment() {

    clearTimeout(
        trialTimer
    );


    const totalTrials =
        results.length;


    const correctResponses =
        results.filter(
            result =>
                result.correct
        ).length;


    const incorrectResponses =
        results.filter(
            result =>
                !result.correct
        ).length;


    const responseTimes =
        results
            .map(
                result =>
                    result.reactionTime
            )
            .filter(
                time =>
                    typeof time ===
                    "number" &&
                    Number.isFinite(time)
            );


    const averageReactionTime =
        responseTimes.length > 0
            ? responseTimes.reduce(
                (sum, time) =>
                    sum + time,
                0
            ) / responseTimes.length
            : null;


    const fastestResponse =
        responseTimes.length > 0
            ? Math.min(
                ...responseTimes
            )
            : null;


    const slowestResponse =
        responseTimes.length > 0
            ? Math.max(
                ...responseTimes
            )
            : null;


    const accuracy =
        totalTrials > 0
            ? (
                correctResponses /
                totalTrials
            ) * 100
            : 0;


    const finalResults = {

        experimentName:
            experiment.name ||
            "CogniLab Experiment",

        completedAt:
            new Date().toISOString(),

        totalTrials:
            totalTrials,

        correctResponses:
            correctResponses,

        incorrectResponses:
            incorrectResponses,

        accuracy:
            accuracy,

        averageReactionTime:
            averageReactionTime,

        fastestResponse:
            fastestResponse,

        slowestResponse:
            slowestResponse,

        trialResults:
            results

    };


    localStorage.setItem(
        "experimentResults",
        JSON.stringify(
            finalResults
        )
    );


    showScreen(
        completionScreen
    );

}


/* =========================================================
   21. BEGIN BUTTON
========================================================= */

beginButton.addEventListener(
    "click",
    () => {

        /*
           If this is the actual experiment
           start screen, reset everything.
        */

        if (
            !experimentStarted
        ) {

            experimentStarted =
                true;

            currentTrialIndex =
                0;

            results = [];

            beginButton.textContent =
                "Begin Experiment →";

            startTrial();

            return;

        }


        /*
           If this is an instruction trial,
           continue to the next normal trial.
        */

        if (
            currentTrial &&
            currentTrial.type ===
            "instruction" &&
            instructionScreen.classList.contains(
                "active"
            )
        ) {

            currentTrialIndex++;

            startTrial();

        }

    }
);


/* =========================================================
   22. KEYBOARD EVENTS
========================================================= */

document.addEventListener(
    "keydown",
    event => {

        /*
           During stimulus:
           process participant response.
        */

        if (
            stimulusScreen.classList.contains(
                "active"
            )
        ) {

            handleKeyboardResponse(
                event
            );

            return;

        }


        /*
           During response screen:
           SPACE moves to the next trial.
        */

        if (
            responseScreen.classList.contains(
                "active"
            ) &&
            event.code ===
            "Space"
        ) {

            event.preventDefault();

            continueAfterResponse();

        }

    }
);


/* =========================================================
   23. MOUSE EVENTS
========================================================= */

stimulus.addEventListener(
    "click",
    () => {

        handleMouseResponse();

    }
);


/* =========================================================
   24. INITIALIZE EXPERIMENT
========================================================= */

updateCounter();

showExperimentInstructions();