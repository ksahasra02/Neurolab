/* =========================================================
   CogniLab Experiment Builder
   Supabase version
========================================================= */


/* ---------------------------------------------------------
   STATE
--------------------------------------------------------- */

let trials = [];

let experimentId = null;

let saving = false;


/* ---------------------------------------------------------
   ELEMENTS
--------------------------------------------------------- */

const experimentName =
    document.getElementById("experimentName");

const experimentDescription =
    document.getElementById("experimentDescription");

const randomizeTrials =
    document.getElementById("randomizeTrials");

const randomizeStimuli =
    document.getElementById("randomizeStimuli");

const trialList =
    document.getElementById("trialList");

const noTrials =
    document.getElementById("noTrials");

const addTrialBtn =
    document.getElementById("addTrialBtn");

const addFirstTrialBtn =
    document.getElementById("addFirstTrialBtn");

const saveBtn =
    document.getElementById("saveBtn");

const previewBtn =
    document.getElementById("previewBtn");

const builderMessage =
    document.getElementById("builderMessage");

const logoutBtn =
    document.getElementById("logoutBtn");


/* ---------------------------------------------------------
   INITIALIZE
--------------------------------------------------------- */

async function initializeBuilder() {

    const user = await requireResearcher();

    if (!user) {
        return;
    }

    /*
     * Check whether we are editing an existing experiment.
     *
     * Example:
     * builder.html?id=EXPERIMENT_ID
     */

    const params =
        new URLSearchParams(window.location.search);

    experimentId =
        params.get("id");


    if (experimentId) {

        await loadExperiment(experimentId);

    } else {

        /*
         * Start with one empty trial.
         */

        addTrial();

    }

    renderTrials();
}


/* ---------------------------------------------------------
   LOAD EXISTING EXPERIMENT
--------------------------------------------------------- */

async function loadExperiment(id) {

    showMessage("Loading experiment...");


    const {
        data: experiment,
        error: experimentError
    } = await supabaseClient
        .from("experiments")
        .select("*")
        .eq("id", id)
        .single();


    if (experimentError) {

        console.error(experimentError);

        showMessage(
            "Could not load the experiment.",
            true
        );

        return;
    }


    /*
     * Put experiment information into the form.
     */

    experimentName.value =
        experiment.name || "";

    experimentDescription.value =
        experiment.description || "";

    randomizeTrials.checked =
        experiment.randomize_trials || false;

    randomizeStimuli.checked =
        experiment.randomize_stimuli || false;


    /*
     * Load trials.
     */

    const {
        data: trialData,
        error: trialError
    } = await supabaseClient
        .from("trials")
        .select("*")
        .eq("experiment_id", id)
        .order("trial_order", {
            ascending: true
        });


    if (trialError) {

        console.error(trialError);

        showMessage(
            "Experiment loaded, but trials could not be loaded.",
            true
        );

        return;
    }


    trials =
        (trialData || []).map(trial => {

            return {

                id: trial.id,

                name:
                    trial.name || "",

                type:
                    trial.trial_type || "reaction",

                stimulus:
                    trial.stimulus || "",

                description:
                    trial.description || "",

                delay:
                    trial.delay_ms ?? 0,

                duration:
                    trial.duration_ms ?? 0,

                responseMethod:
                    trial.response_method || "keyboard",

                correctKey:
                    trial.correct_key || "",

                correctNext:
                    trial.correct_next || "",

                incorrectNext:
                    trial.incorrect_next || ""

            };

        });


    showMessage("");
}


/* ---------------------------------------------------------
   ADD TRIAL
--------------------------------------------------------- */

function addTrial() {

    const trial = {

        /*
         * Temporary ID.
         *
         * This lets us connect branching before the
         * database IDs exist.
         */

        id:
            "local-" +
            Date.now() +
            "-" +
            Math.random()
                .toString(36)
                .substring(2, 8),

        name:
            `Trial ${trials.length + 1}`,

        type:
            "reaction",

        stimulus:
            "",

        description:
            "",

        delay:
            0,

        duration:
            0,

        responseMethod:
            "keyboard",

        correctKey:
            "Space",

        correctNext:
            "",

        incorrectNext:
            ""

    };


    trials.push(trial);

    renderTrials();
}


/* ---------------------------------------------------------
   DELETE TRIAL
--------------------------------------------------------- */

function deleteTrial(index) {

    if (trials.length === 1) {

        alert(
            "Your experiment must contain at least one trial."
        );

        return;
    }


    trials.splice(index, 1);

    renderTrials();
}


/* ---------------------------------------------------------
   RENDER TRIALS
--------------------------------------------------------- */

function renderTrials() {

    trialList.innerHTML = "";


    if (trials.length === 0) {

        noTrials.style.display = "block";

        return;
    }


    noTrials.style.display = "none";


    trials.forEach((trial, index) => {

        const card =
            document.createElement("div");

        card.className =
            "trial-card";


        card.innerHTML = `

            <div class="trial-card-header">

                <div>

                    <span class="trial-number">
                        Trial ${index + 1}
                    </span>

                    <h3>
                        ${escapeHTML(trial.name)}
                    </h3>

                </div>

                <button
                    type="button"
                    class="delete-trial-btn"
                    data-index="${index}">
                    Delete
                </button>

            </div>


            <div class="trial-form-grid">

                <!-- Trial name -->

                <div class="form-group">

                    <label>
                        Trial Name
                    </label>

                    <input
                        type="text"
                        class="trial-name"
                        data-index="${index}"
                        value="${escapeAttribute(trial.name)}"
                        placeholder="Trial name"
                    >

                </div>


                <!-- Trial type -->

                <div class="form-group">

                    <label>
                        Trial Type
                    </label>

                    <select
                        class="trial-type"
                        data-index="${index}">

                        <option
                            value="instruction"
                            ${trial.type === "instruction" ? "selected" : ""}>
                            Instruction
                        </option>

                        <option
                            value="reaction"
                            ${trial.type === "reaction" ? "selected" : ""}>
                            Reaction Time
                        </option>

                        <option
                            value="choice"
                            ${trial.type === "choice" ? "selected" : ""}>
                            Choice
                        </option>

                    </select>

                </div>


                <!-- Stimulus -->

                <div class="form-group">

                    <label>
                        Stimulus
                    </label>

                    <input
                        type="text"
                        class="trial-stimulus"
                        data-index="${index}"
                        value="${escapeAttribute(trial.stimulus)}"
                        placeholder="e.g. Red circle"
                    >

                </div>


                <!-- Description -->

                <div class="form-group">

                    <label>
                        Description
                    </label>

                    <input
                        type="text"
                        class="trial-description"
                        data-index="${index}"
                        value="${escapeAttribute(trial.description)}"
                        placeholder="What should the participant do?"
                    >

                </div>


                <!-- Delay -->

                <div class="form-group">

                    <label>
                        Delay (ms)
                    </label>

                    <input
                        type="number"
                        class="trial-delay"
                        data-index="${index}"
                        value="${trial.delay}"
                        min="0"
                    >

                </div>


                <!-- Duration -->

                <div class="form-group">

                    <label>
                        Duration (ms)
                    </label>

                    <input
                        type="number"
                        class="trial-duration"
                        data-index="${index}"
                        value="${trial.duration}"
                        min="0"
                    >

                </div>


                <!-- Response -->

                <div class="form-group">

                    <label>
                        Response Method
                    </label>

                    <select
                        class="trial-response"
                        data-index="${index}">

                        <option
                            value="keyboard"
                            ${trial.responseMethod === "keyboard" ? "selected" : ""}>
                            Keyboard
                        </option>

                        <option
                            value="mouse"
                            ${trial.responseMethod === "mouse" ? "selected" : ""}>
                            Mouse
                        </option>

                        <option
                            value="none"
                            ${trial.responseMethod === "none" ? "selected" : ""}>
                            None
                        </option>

                    </select>

                </div>


                <!-- Correct key -->

                <div class="form-group">

                    <label>
                        Correct Key
                    </label>

                    <input
                        type="text"
                        class="trial-correct-key"
                        data-index="${index}"
                        value="${escapeAttribute(trial.correctKey)}"
                        placeholder="e.g. Space"
                    >

                </div>


                <!-- Correct branch -->

                <div class="form-group">

                    <label>
                        If Correct → Trial
                    </label>

                    <select
                        class="trial-correct-next"
                        data-index="${index}">

                        ${getTrialOptions(
                            trial.correctNext,
                            index
                        )}

                    </select>

                </div>


                <!-- Incorrect branch -->

                <div class="form-group">

                    <label>
                        If Incorrect → Trial
                    </label>

                    <select
                        class="trial-incorrect-next"
                        data-index="${index}">

                        ${getTrialOptions(
                            trial.incorrectNext,
                            index
                        )}

                    </select>

                </div>

            </div>

        `;


        trialList.appendChild(card);

    });


    attachTrialEvents();
}


/* ---------------------------------------------------------
   TRIAL OPTIONS
--------------------------------------------------------- */

function getTrialOptions(selectedId, currentIndex) {

    let html = `
        <option value="">
            End experiment
        </option>
    `;


    trials.forEach((trial, index) => {

        /*
         * A trial should not branch to itself.
         */

        if (index === currentIndex) {
            return;
        }


        html += `
            <option
                value="${escapeAttribute(trial.id)}"
                ${trial.id === selectedId ? "selected" : ""}>
                Trial ${index + 1}
            </option>
        `;

    });


    return html;
}


/* ---------------------------------------------------------
   TRIAL EVENTS
--------------------------------------------------------- */

function attachTrialEvents() {

    document
        .querySelectorAll(".delete-trial-btn")
        .forEach(button => {

            button.addEventListener(
                "click",
                function() {

                    const index =
                        Number(this.dataset.index);

                    deleteTrial(index);

                }
            );

        });


    document
        .querySelectorAll(".trial-name")
        .forEach(input => {

            input.addEventListener(
                "input",
                function() {

                    trials[
                        Number(this.dataset.index)
                    ].name = this.value;

                }
            );

        });


    document
        .querySelectorAll(".trial-type")
        .forEach(input => {

            input.addEventListener(
                "change",
                function() {

                    trials[
                        Number(this.dataset.index)
                    ].type = this.value;

                }
            );

        });


    document
        .querySelectorAll(".trial-stimulus")
        .forEach(input => {

            input.addEventListener(
                "input",
                function() {

                    trials[
                        Number(this.dataset.index)
                    ].stimulus = this.value;

                }
            );

        });


    document
        .querySelectorAll(".trial-description")
        .forEach(input => {

            input.addEventListener(
                "input",
                function() {

                    trials[
                        Number(this.dataset.index)
                    ].description = this.value;

                }
            );

        });


    document
        .querySelectorAll(".trial-delay")
        .forEach(input => {

            input.addEventListener(
                "input",
                function() {

                    trials[
                        Number(this.dataset.index)
                    ].delay =
                        Number(this.value) || 0;

                }
            );

        });


    document
        .querySelectorAll(".trial-duration")
        .forEach(input => {

            input.addEventListener(
                "input",
                function() {

                    trials[
                        Number(this.dataset.index)
                    ].duration =
                        Number(this.value) || 0;

                }
            );

        });


    document
        .querySelectorAll(".trial-response")
        .forEach(input => {

            input.addEventListener(
                "change",
                function() {

                    trials[
                        Number(this.dataset.index)
                    ].responseMethod =
                        this.value;

                }
            );

        });


    document
        .querySelectorAll(".trial-correct-key")
        .forEach(input => {

            input.addEventListener(
                "input",
                function() {

                    trials[
                        Number(this.dataset.index)
                    ].correctKey =
                        this.value;

                }
            );

        });


    document
        .querySelectorAll(".trial-correct-next")
        .forEach(input => {

            input.addEventListener(
                "change",
                function() {

                    trials[
                        Number(this.dataset.index)
                    ].correctNext =
                        this.value;

                }
            );

        });


    document
        .querySelectorAll(".trial-incorrect-next")
        .forEach(input => {

            input.addEventListener(
                "change",
                function() {

                    trials[
                        Number(this.dataset.index)
                    ].incorrectNext =
                        this.value;

                }
            );

        });

}


/* ---------------------------------------------------------
   SAVE EXPERIMENT
--------------------------------------------------------- */

async function saveExperiment() {

    if (saving) {
        return;
    }


    const name =
        experimentName.value.trim();

    const description =
        experimentDescription.value.trim();


    if (!name) {

        showMessage(
            "Please enter an experiment name.",
            true
        );

        experimentName.focus();

        return;
    }


    if (trials.length === 0) {

        showMessage(
            "Please add at least one trial.",
            true
        );

        return;
    }


    saving = true;

    saveBtn.disabled = true;

    saveBtn.textContent =
        "Saving...";


    try {

        /*
         * Make sure the researcher is logged in.
         */

        const user =
            await requireResearcher();

        if (!user) {
            return;
        }


        let currentExperimentId =
            experimentId;


        /* ---------------------------------------------
           CREATE OR UPDATE EXPERIMENT
        --------------------------------------------- */

        if (!currentExperimentId) {

            const {
                data,
                error
            } = await supabaseClient
                .from("experiments")
                .insert({

                    researcher_id:
                        user.id,

                    name:
                        name,

                    description:
                        description,

                    randomize_trials:
                        randomizeTrials.checked,

                    randomize_stimuli:
                        randomizeStimuli.checked

                })
                .select()
                .single();


            if (error) {
                throw error;
            }


            currentExperimentId =
                data.id;

            experimentId =
                data.id;


            /*
             * Update browser URL.
             */

            window.history.replaceState(
                {},
                "",
                `builder.html?id=${data.id}`
            );

        } else {

            const {
                error
            } = await supabaseClient
                .from("experiments")
                .update({

                    name:
                        name,

                    description:
                        description,

                    randomize_trials:
                        randomizeTrials.checked,

                    randomize_stimuli:
                        randomizeStimuli.checked

                })
                .eq(
                    "id",
                    currentExperimentId
                );


            if (error) {
                throw error;
            }

        }


        /* ---------------------------------------------
           LOAD EXISTING DATABASE TRIALS
        --------------------------------------------- */

        const {
            data: existingTrials,
            error: existingError
        } = await supabaseClient
            .from("trials")
            .select("id")
            .eq(
                "experiment_id",
                currentExperimentId
            );


        if (existingError) {
            throw existingError;
        }


        /*
         * Delete old trials.
         *
         * We recreate them so the trial order and branching
         * stay simple and predictable.
         */

        if (existingTrials &&
            existingTrials.length > 0) {

            const {
                error
            } = await supabaseClient
                .from("trials")
                .delete()
                .eq(
                    "experiment_id",
                    currentExperimentId
                );


            if (error) {
                throw error;
            }

        }


        /* ---------------------------------------------
           INSERT TRIALS
        --------------------------------------------- */

        const trialRows =
            trials.map((trial, index) => {

                return {

                    experiment_id:
                        currentExperimentId,

                    trial_order:
                        index + 1,

                    name:
                        trial.name,

                    trial_type:
                        trial.type,

                    stimulus_type:
                        "text",

                    stimulus:
                        trial.stimulus,

                    description:
                        trial.description,

                    delay_ms:
                        Number(trial.delay) || 0,

                    duration_ms:
                        Number(trial.duration) || 0,

                    response_method:
                        trial.responseMethod,

                    correct_key:
                        trial.correctKey || null,

                    /*
                     * Branches are temporarily null.
                     * We set them after database IDs exist.
                     */

                    correct_next:
                        null,

                    incorrect_next:
                        null

                };

            });


        const {
            data: insertedTrials,
            error: insertError
        } = await supabaseClient
            .from("trials")
            .insert(trialRows)
            .select();


        if (insertError) {
            throw insertError;
        }


        /*
         * Map local trial IDs → database trial IDs.
         *
         * Both arrays use the same order.
         */

        const idMap = new Map();


        trials.forEach(
            (localTrial, index) => {

                idMap.set(
                    localTrial.id,
                    insertedTrials[index].id
                );

            }
        );


        /* ---------------------------------------------
           UPDATE BRANCHING
        --------------------------------------------- */

        for (
            let i = 0;
            i < trials.length;
            i++
        ) {

            const localTrial =
                trials[i];

            const databaseTrial =
                insertedTrials[i];


            const correctNext =
                localTrial.correctNext
                    ? idMap.get(
                        localTrial.correctNext
                    ) || null
                    : null;


            const incorrectNext =
                localTrial.incorrectNext
                    ? idMap.get(
                        localTrial.incorrectNext
                    ) || null
                    : null;


            const {
                error
            } = await supabaseClient
                .from("trials")
                .update({

                    correct_next:
                        correctNext,

                    incorrect_next:
                        incorrectNext

                })
                .eq(
                    "id",
                    databaseTrial.id
                );


            if (error) {
                throw error;
            }

        }


        /*
         * Replace temporary IDs with database IDs.
         */

        trials =
            insertedTrials.map(
                (dbTrial, index) => {

                    return {

                        ...trials[index],

                        id:
                            dbTrial.id

                    };

                }
            );


        renderTrials();


        showMessage(
            "Experiment saved successfully!"
        );


    } catch (error) {

        console.error(
            "Save experiment error:",
            error
        );


        showMessage(
            error.message ||
            "Could not save experiment.",
            true
        );

    } finally {

        saving = false;

        saveBtn.disabled = false;

        saveBtn.textContent =
            "Save Experiment";

    }

}


/* ---------------------------------------------------------
   PREVIEW
--------------------------------------------------------- */

function previewExperiment() {

    const previewData = {

        id:
            experimentId,

        name:
            experimentName.value.trim(),

        description:
            experimentDescription.value.trim(),

        randomizeTrials:
            randomizeTrials.checked,

        randomizeStimuli:
            randomizeStimuli.checked,

        trials:
            trials

    };


    /*
     * Temporary localStorage is used ONLY for preview.
     *
     * The real saved experiment is in Supabase.
     */

    localStorage.setItem(
        "cognilabPreviewExperiment",
        JSON.stringify(previewData)
    );


    window.open(
        "experiment.html?preview=true",
        "_blank"
    );

}


/* ---------------------------------------------------------
   MESSAGE
--------------------------------------------------------- */

function showMessage(
    message,
    isError = false
) {

    builderMessage.textContent =
        message;

    builderMessage.className =
        "builder-message" +
        (isError
            ? " error"
            : " success");


    if (!message) {
        builderMessage.className =
            "builder-message";
    }

}


/* ---------------------------------------------------------
   ESCAPE HTML
--------------------------------------------------------- */

function escapeHTML(value) {

    const div =
        document.createElement("div");

    div.textContent =
        value == null
            ? ""
            : String(value);

    return div.innerHTML;
}


/* ---------------------------------------------------------
   ESCAPE ATTRIBUTE
--------------------------------------------------------- */

function escapeAttribute(value) {

    return escapeHTML(value)
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* ---------------------------------------------------------
   BUTTON EVENTS
--------------------------------------------------------- */

addTrialBtn.addEventListener(
    "click",
    addTrial
);


addFirstTrialBtn.addEventListener(
    "click",
    addTrial
);


saveBtn.addEventListener(
    "click",
    saveExperiment
);


previewBtn.addEventListener(
    "click",
    previewExperiment
);


logoutBtn.addEventListener(
    "click",
    async function() {

        await logout();

        window.location.href =
            "login.html";

    }
);


/* ---------------------------------------------------------
   START
--------------------------------------------------------- */

initializeBuilder();