/* =========================================================
   COgNILAB EXPERIMENT BUILDER
========================================================= */


/* =========================================================
   STORAGE
========================================================= */

const STORAGE_KEY = "cognilabExperiment";


/* =========================================================
   DEFAULT EXPERIMENT
========================================================= */

const defaultExperiment = {

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
        },


        {
            id: "trial-3",

            name: "Circle Response",

            type: "reaction",

            stimulus: "circle",

            description:
                "Respond when the circle appears.",

            duration: 500,

            delay: 1000,

            responseMethod: "keyboard",

            correctKey: "Space",

            correctNext: null,

            incorrectNext: null
        },


        {
            id: "trial-4",

            name: "Square Response",

            type: "reaction",

            stimulus: "square",

            description:
                "Respond when the square appears.",

            duration: 500,

            delay: 1000,

            responseMethod: "keyboard",

            correctKey: "Enter",

            correctNext: null,

            incorrectNext: null
        },


        {
            id: "trial-5",

            name: "Final Trial",

            type: "reaction",

            stimulus: "circle",

            description:
                "Complete the final reaction-time trial.",

            duration: 500,

            delay: 1000,

            responseMethod: "keyboard",

            correctKey: "Space",

            correctNext: null,

            incorrectNext: null
        }

    ]

};


/* =========================================================
   LOAD EXPERIMENT
========================================================= */

let experiment;


try {

    const savedExperiment =
        localStorage.getItem(STORAGE_KEY);

    experiment =
        savedExperiment
            ? JSON.parse(savedExperiment)
            : JSON.parse(
                JSON.stringify(defaultExperiment)
            );

} catch (error) {

    console.error(
        "Could not load experiment:",
        error
    );

    experiment =
        JSON.parse(
            JSON.stringify(defaultExperiment)
        );
}


/* =========================================================
   ENSURE OLD DATA HAS TRIAL IDs
========================================================= */

experiment.trials.forEach((trial, index) => {

    if (!trial.id) {

        trial.id =
            `trial-${Date.now()}-${index}`;

    }

});


/* =========================================================
   CURRENT TRIAL
========================================================= */

let selectedTrialIndex = 0;


/* =========================================================
   HELPER
========================================================= */

function getElement(id) {

    return document.getElementById(id);

}


/* =========================================================
   ELEMENT REFERENCES
========================================================= */

const elements = {

    list:
        getElement("trialList"),

    count:
        getElement("trialCount"),

    add:
        getElement("addTrialButton"),

    delete:
        getElement("deleteTrialButton"),

    saveStatus:
        getElement("saveStatus"),

    name:
        getElement("trialName"),

    type:
        getElement("trialType"),

    stimulus:
        getElement("stimulusType"),

    description:
        getElement("stimulusDescription"),

    delay:
        getElement("delay"),

    duration:
        getElement("duration"),

    method:
        getElement("responseMethod"),

    key:
        getElement("allowedKey"),

    randomizeTrials:
        getElement("randomizeTrials"),

    randomizeStimulus:
        getElement("randomizeStimulus"),

    number:
        getElement("settingsTrialNumber"),

    correctNext:
        getElement("correctNext"),

    incorrectNext:
        getElement("incorrectNext"),

    previewTitle:
        getElement("previewTitle"),

    previewDescription:
        getElement("previewDescription"),

    previewKey:
        getElement("previewKey"),

    previewStimulus:
        getElement("builderStimulus"),

    previewProgress:
        getElement("previewProgress"),

    timelineStimulus:
        getElement("timelineStimulus"),

    timelineResponse:
        getElement("timelineResponse")

};


/* =========================================================
   SAVE EXPERIMENT
========================================================= */

function saveExperiment() {

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(experiment)
    );

    elements.saveStatus.textContent =
        "Saved";

    elements.saveStatus.style.color =
        "#61d68b";
}


/* =========================================================
   SHOW UNSAVED STATUS
========================================================= */

function markUnsaved() {

    elements.saveStatus.textContent =
        "Unsaved changes";

    elements.saveStatus.style.color =
        "#f4b942";
}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(value) {

    return String(value ?? "")
        .replace(
            /[&<>"']/g,

            function (character) {

                const replacements = {

                    "&": "&amp;",
                    "<": "&lt;",
                    ">": "&gt;",
                    '"': "&quot;",
                    "'": "&#039;"

                };

                return replacements[character];

            }
        );

}


/* =========================================================
   GET KEY DISPLAY NAME
========================================================= */

function getKeyDisplayName(key) {

    const names = {

        Space: "SPACE",

        Enter: "ENTER",

        ArrowLeft: "LEFT ARROW",

        ArrowRight: "RIGHT ARROW"

    };

    return names[key] || key;

}


/* =========================================================
   GET TRIAL NUMBER
========================================================= */

function formatTrialNumber(index) {

    return String(index + 1)
        .padStart(2, "0");

}


/* =========================================================
   BRANCH OPTIONS
========================================================= */

function populateBranchOptions(
    selectElement,
    currentTarget
) {

    if (!selectElement) {
        return;
    }


    selectElement.innerHTML = "";


    /* Next trial option */

    const nextOption =
        document.createElement("option");

    nextOption.value = "";

    nextOption.textContent =
        "Next trial / End";

    selectElement.appendChild(
        nextOption
    );


    /* Individual trial options */

    experiment.trials.forEach(
        function (trial, index) {

            /*
             * A trial cannot branch
             * to itself.
             */

            if (
                index === selectedTrialIndex
            ) {

                return;

            }


            const option =
                document.createElement("option");

            option.value =
                trial.id;

            option.textContent =
                `Trial ${formatTrialNumber(index)} — ${trial.name}`;

            selectElement.appendChild(
                option
            );

        }
    );


    if (currentTarget) {

        selectElement.value =
            currentTarget;

    } else {

        selectElement.value =
            "";

    }

}


/* =========================================================
   RENDER TRIAL LIST
========================================================= */

function renderTrialList() {

    elements.list.innerHTML = "";


    elements.count.textContent =
        experiment.trials.length;


    experiment.trials.forEach(
        function (trial, index) {

            const button =
                document.createElement("button");


            button.type = "button";


            button.className =
                "trial-item" +
                (
                    index === selectedTrialIndex
                        ? " active"
                        : ""
                );


            button.innerHTML = `

                <span class="trial-number">
                    ${formatTrialNumber(index)}
                </span>

                <span class="trial-name">
                    ${escapeHTML(trial.name)}
                </span>

            `;


            button.addEventListener(
                "click",
                function () {

                    saveCurrentTrial();

                    selectedTrialIndex =
                        index;

                    renderTrialList();

                    loadSelectedTrial();

                }
            );


            elements.list.appendChild(
                button
            );

        }
    );


    updateBranchOptions();

}


/* =========================================================
   UPDATE BRANCH OPTIONS
========================================================= */

function updateBranchOptions() {

    const trial =
        experiment.trials[
            selectedTrialIndex
        ];


    if (!trial) {
        return;
    }


    populateBranchOptions(
        elements.correctNext,
        trial.correctNext
    );


    populateBranchOptions(
        elements.incorrectNext,
        trial.incorrectNext
    );

}


/* =========================================================
   LOAD SELECTED TRIAL
========================================================= */

function loadSelectedTrial() {

    const trial =
        experiment.trials[
            selectedTrialIndex
        ];


    if (!trial) {
        return;
    }


    elements.name.value =
        trial.name || "";


    elements.type.value =
        trial.type || "reaction";


    elements.stimulus.value =
        trial.stimulus || "circle";


    elements.description.value =
        trial.description || "";


    elements.delay.value =
        trial.delay ?? 1000;


    elements.duration.value =
        trial.duration ?? 500;


    elements.method.value =
        trial.responseMethod ||
        "keyboard";


    elements.key.value =
        trial.correctKey ||
        "Space";


    elements.number.textContent =
        formatTrialNumber(
            selectedTrialIndex
        );


    updateBranchOptions();

    updatePreview();

}


/* =========================================================
   SAVE CURRENT TRIAL
========================================================= */

function saveCurrentTrial() {

    const trial =
        experiment.trials[
            selectedTrialIndex
        ];


    if (!trial) {
        return;
    }


    trial.name =
        elements.name.value.trim() ||
        `Trial ${selectedTrialIndex + 1}`;


    trial.type =
        elements.type.value;


    trial.stimulus =
        elements.stimulus.value;


    trial.description =
        elements.description.value;


    trial.delay =
        Number(elements.delay.value) || 0;


    trial.duration =
        Number(elements.duration.value) || 500;


    trial.responseMethod =
        elements.method.value;


    trial.correctKey =
        elements.key.value;


    trial.correctNext =
        elements.correctNext.value ||
        null;


    trial.incorrectNext =
        elements.incorrectNext.value ||
        null;


    updatePreview();

    markUnsaved();

}


/* =========================================================
   UPDATE PREVIEW
========================================================= */

function updatePreview() {

    const trial =
        experiment.trials[
            selectedTrialIndex
        ];


    if (!trial) {
        return;
    }


    elements.previewProgress.textContent =
        `Trial ${formatTrialNumber(selectedTrialIndex)}`;


    elements.previewTitle.textContent =
        trial.name;


    elements.previewDescription.textContent =
        trial.description;


    elements.previewKey.textContent =
        getKeyDisplayName(
            trial.correctKey
        );


    /*
     * Stimulus shape
     */

    elements.previewStimulus.className =
        "preview-stimulus " +
        (
            trial.stimulus === "square"
                ? "square"
                : "circle"
        );


    /*
     * Timeline information
     */

    elements.timelineStimulus.textContent =
        `${trial.stimulus} appears after ${trial.delay} ms`;


    elements.timelineResponse.textContent =
        `Wait for ${getKeyDisplayName(
            trial.correctKey
        )} response`;

}


/* =========================================================
   ADD TRIAL
========================================================= */

elements.add.addEventListener(
    "click",
    function () {

        saveCurrentTrial();


        const newTrialNumber =
            experiment.trials.length + 1;


        const newTrial = {

            id:
                `trial-${Date.now()}`,

            name:
                `Trial ${newTrialNumber}`,

            type:
                "reaction",

            stimulus:
                "circle",

            description:
                "Press SPACE as quickly as possible when the stimulus appears.",

            duration:
                500,

            delay:
                1000,

            responseMethod:
                "keyboard",

            correctKey:
                "Space",

            correctNext:
                null,

            incorrectNext:
                null

        };


        experiment.trials.push(
            newTrial
        );


        selectedTrialIndex =
            experiment.trials.length - 1;


        renderTrialList();

        loadSelectedTrial();

        markUnsaved();

    }
);


/* =========================================================
   DELETE TRIAL
========================================================= */

elements.delete.addEventListener(
    "click",
    function () {

        /*
         * Always keep at least
         * one trial.
         */

        if (
            experiment.trials.length <= 1
        ) {

            alert(
                "At least one trial must remain."
            );

            return;

        }


        const trialNumber =
            selectedTrialIndex + 1;


        const confirmed =
            confirm(
                `Are you sure you want to delete Trial ${trialNumber}?`
            );


        if (!confirmed) {
            return;
        }


        const deletedTrial =
            experiment.trials[
                selectedTrialIndex
            ];


        const deletedTrialId =
            deletedTrial.id;


        /*
         * Remove the trial.
         */

        experiment.trials.splice(
            selectedTrialIndex,
            1
        );


        /*
         * Remove any branching
         * references pointing to
         * the deleted trial.
         */

        experiment.trials.forEach(
            function (trial) {

                if (
                    trial.correctNext ===
                    deletedTrialId
                ) {

                    trial.correctNext = null;

                }


                if (
                    trial.incorrectNext ===
                    deletedTrialId
                ) {

                    trial.incorrectNext = null;

                }

            }
        );


        /*
         * Fix selected index.
         */

        if (
            selectedTrialIndex >=
            experiment.trials.length
        ) {

            selectedTrialIndex =
                experiment.trials.length - 1;

        }


        renderTrialList();

        loadSelectedTrial();

        saveExperiment();

    }
);


/* =========================================================
   FIELD CHANGE HANDLERS
========================================================= */

const editableFields = [

    elements.name,

    elements.type,

    elements.stimulus,

    elements.description,

    elements.delay,

    elements.duration,

    elements.method,

    elements.key,

    elements.correctNext,

    elements.incorrectNext

];


editableFields.forEach(
    function (field) {

        if (!field) {
            return;
        }


        field.addEventListener(
            "input",
            function () {

                saveCurrentTrial();

            }
        );


        field.addEventListener(
            "change",
            function () {

                saveCurrentTrial();

            }
        );

    }
);


/* =========================================================
   RANDOMIZATION
========================================================= */

elements.randomizeTrials.addEventListener(
    "change",
    function () {

        experiment.randomizeTrials =
            elements.randomizeTrials.checked;


        saveExperiment();

    }
);


elements.randomizeStimulus.addEventListener(
    "change",
    function () {

        experiment.randomizeStimulus =
            elements.randomizeStimulus.checked;


        saveExperiment();

    }
);


/* =========================================================
   DEMO TRIAL
========================================================= */

const demoButton =
    getElement("demoButton");


demoButton.addEventListener(
    "click",
    function () {

        const trial =
            experiment.trials[
                selectedTrialIndex
            ];


        if (!trial) {
            return;
        }


        demoButton.disabled = true;

        demoButton.textContent =
            "Get Ready...";


        elements.previewStimulus.style.opacity =
            "0";


        /*
         * Wait before showing
         * the stimulus.
         */

        setTimeout(
            function () {

                elements.previewStimulus.style.opacity =
                    "1";


                demoButton.textContent =
                    "Stimulus Active";


                /*
                 * Hide stimulus after
                 * configured duration.
                 */

                setTimeout(
                    function () {

                        elements.previewStimulus.style.opacity =
                            "0";


                        demoButton.textContent =
                            "Trial Complete";


                        setTimeout(
                            function () {

                                elements.previewStimulus.style.opacity =
                                    "1";

                                demoButton.disabled =
                                    false;

                                demoButton.textContent =
                                    "Run Trial";

                            },
                            300
                        );

                    },
                    trial.duration || 500
                );

            },
            trial.delay || 1000
        );

    }
);


/* =========================================================
   RANDOMIZATION CHECKBOX INITIALIZATION
========================================================= */

elements.randomizeTrials.checked =
    Boolean(
        experiment.randomizeTrials
    );


elements.randomizeStimulus.checked =
    Boolean(
        experiment.randomizeStimulus
    );


/* =========================================================
   INITIAL RENDER
========================================================= */

renderTrialList();

loadSelectedTrial();

saveExperiment();