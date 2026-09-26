/* =========================================================
   COGNILAB - PUBLISH PAGE
   ========================================================= */


/* =========================================================
   1. GET HTML ELEMENTS
========================================================= */

const nameInput =
    document.getElementById("name");

const publishButton =
    document.getElementById("publish");

const resultBox =
    document.getElementById("result");

const linkInput =
    document.getElementById("link");

const copyButton =
    document.getElementById("copy");

const openLink =
    document.getElementById("open");

const trialCount =
    document.getElementById("trialCount");

const randomization =
    document.getElementById("randomization");

const statusBox =
    document.getElementById("status");


/* =========================================================
   2. LOAD EXPERIMENT
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
        "Could not load experiment:",
        error
    );

}


/* =========================================================
   3. CHECK EXPERIMENT
========================================================= */

if (
    !experiment ||
    !Array.isArray(
        experiment.trials
    ) ||
    experiment.trials.length === 0
) {

    publishButton.disabled =
        true;


    statusBox.innerHTML = `

        <span>●</span>

        <div>

            <strong>
                No experiment found
            </strong>

            <small>
                Create at least one trial
                in the Builder before publishing.
            </small>

        </div>

    `;


    statusBox.classList.add(
        "status-error"
    );

} else {

    initializePublishPage();

}


/* =========================================================
   4. INITIALIZE PAGE
========================================================= */

function initializePublishPage() {

    /*
       Put experiment name into input.
    */

    nameInput.value =
        experiment.name ||
        "Reaction Time Study";


    /*
       Show number of trials.
    */

    trialCount.textContent =
        experiment.trials.length;


    /*
       Show randomization state.
    */

    const randomizeTrials =
        Boolean(
            experiment.randomizeTrials
        );

    const randomizeStimulus =
        Boolean(
            experiment.randomizeStimulus
        );


    if (
        randomizeTrials ||
        randomizeStimulus
    ) {

        randomization.textContent =
            "ON";

    } else {

        randomization.textContent =
            "OFF";

    }

}


/* =========================================================
   5. GENERATE PARTICIPANT LINK
========================================================= */

publishButton.addEventListener(
    "click",
    () => {

        if (!experiment) {

            return;

        }


        /*
           Get the experiment name.
        */

        const experimentName =
            nameInput.value.trim();


        /*
           Do not allow an empty name.
        */

        if (!experimentName) {

            nameInput.focus();

            nameInput.style.borderColor =
                "#e77468";

            return;

        }


        nameInput.style.borderColor =
            "";


        /*
           Save the edited experiment name.
        */

        experiment.name =
            experimentName;


        localStorage.setItem(
            "cognilabExperiment",
            JSON.stringify(
                experiment
            )
        );


        /*
           Create the participant URL.

           In the frontend prototype,
           experiment.html reads the experiment
           from localStorage.
        */

        const participantURL =
            new URL(
                "experiment.html",
                window.location.href
            ).href;


        linkInput.value =
            participantURL;


        /*
           The Open button uses the same URL.
        */

        openLink.href =
            participantURL;


        /*
           Display generated link area.
        */

        resultBox.classList.remove(
            "hidden"
        );


        /*
           Change status.
        */

        statusBox.innerHTML = `

            <span>●</span>

            <div>

                <strong>
                    Experiment published
                </strong>

                <small>
                    Your participant link is ready.
                </small>

            </div>

        `;


        /*
           Remember that the experiment
           has been published.
        */

        localStorage.setItem(
            "cognilabPublished",
            "true"
        );


        /*
           Update button text.
        */

        publishButton.textContent =
            "Published ✓";


        /*
           Scroll to generated link.
        */

        resultBox.scrollIntoView({
            behavior: "smooth",
            block: "nearest"
        });

    }
);


/* =========================================================
   6. COPY PARTICIPANT LINK
========================================================= */

copyButton.addEventListener(
    "click",
    async () => {

        const link =
            linkInput.value;


        if (!link) {

            return;

        }


        try {

            /*
               Modern clipboard API.
            */

            await navigator.clipboard.writeText(
                link
            );


            copyButton.textContent =
                "Copied ✓";


        } catch (error) {

            /*
               Fallback for browsers where
               clipboard API is unavailable.
            */

            linkInput.focus();

            linkInput.select();

            document.execCommand(
                "copy"
            );


            copyButton.textContent =
                "Copied ✓";

        }


        /*
           Restore button text.
        */

        setTimeout(
            () => {

                copyButton.textContent =
                    "Copy";

            },
            1800
        );

    }
);


/* =========================================================
   7. CLEAR ERROR WHEN USER TYPES
========================================================= */

nameInput.addEventListener(
    "input",
    () => {

        nameInput.style.borderColor =
            "";

    }
);