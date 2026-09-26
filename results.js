/* =========================================================
   COGNILAB - RESULTS PAGE
   ========================================================= */


/* =========================================================
   1. GET HTML ELEMENTS
========================================================= */

const totalElement =
    document.getElementById("total");

const accuracyElement =
    document.getElementById("accuracy");

const averageElement =
    document.getElementById("average");

const rangeElement =
    document.getElementById("range");

const rowsElement =
    document.getElementById("rows");

const experimentNameElement =
    document.getElementById("experimentName");

const completedAtElement =
    document.getElementById("completedAt");


/* =========================================================
   2. LOAD RESULTS
========================================================= */

let resultsData = null;

try {

    const savedResults =
        localStorage.getItem(
            "experimentResults"
        );

    if (savedResults) {

        resultsData =
            JSON.parse(savedResults);

    }

} catch (error) {

    console.error(
        "Could not load experiment results:",
        error
    );

}


/* =========================================================
   3. HELPER FUNCTIONS
========================================================= */


/*
   Safely display text inside the table.

   This prevents experiment names or responses
   from being interpreted as HTML.
*/

function escapeHTML(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


/*
   Format reaction time.
*/

function formatReactionTime(time) {

    if (
        time === null ||
        time === undefined ||
        !Number.isFinite(
            Number(time)
        )
    ) {

        return "—";

    }


    return `${Math.round(
        Number(time)
    )} ms`;

}


/*
   Format date/time.
*/

function formatDateTime(value) {

    if (!value) {

        return "—";

    }


    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "—";

    }


    return date.toLocaleString();

}


/* =========================================================
   4. SHOW EMPTY STATE
========================================================= */

function showEmptyState() {

    totalElement.textContent =
        "0";

    accuracyElement.textContent =
        "0%";

    averageElement.textContent =
        "—";

    rangeElement.textContent =
        "—";

    experimentNameElement.textContent =
        "No experiment run yet";

    completedAtElement.textContent =
        "—";


    rowsElement.innerHTML = `

        <tr>

            <td
                colspan="6"
                class="empty"
            >
                No results yet.
                Run the participant experiment first.
            </td>

        </tr>

    `;

}


/* =========================================================
   5. UPDATE SUMMARY
========================================================= */

function updateSummary(data) {

    const total =
        Number(data.totalTrials) || 0;


    const accuracy =
        Number(data.accuracy) || 0;


    totalElement.textContent =
        total;


    accuracyElement.textContent =
        `${Math.round(
            accuracy
        )}%`;


    /*
       Average reaction time can be null
       when every trial timed out.
    */

    if (
        data.averageReactionTime !== null &&
        data.averageReactionTime !== undefined
    ) {

        averageElement.textContent =
            formatReactionTime(
                data.averageReactionTime
            );

    } else {

        averageElement.textContent =
            "—";

    }


    const fastest =
        data.fastestResponse;


    const slowest =
        data.slowestResponse;


    if (
        fastest !== null &&
        fastest !== undefined &&
        slowest !== null &&
        slowest !== undefined
    ) {

        rangeElement.textContent =
            `${Math.round(
                fastest
            )}–${Math.round(
                slowest
            )} ms`;

    } else {

        rangeElement.textContent =
            "—";

    }


    experimentNameElement.textContent =
        data.experimentName ||
        "CogniLab Experiment";


    completedAtElement.textContent =
        formatDateTime(
            data.completedAt
        );

}


/* =========================================================
   6. CREATE RESULT ROW
========================================================= */

function createResultRow(result) {

    const trialNumber =
        result.trial ?? "—";


    const stimulus =
        result.stimulus || "—";


    const expected =
        result.correctKey
            ? formatKey(
                result.correctKey
            )
            : "—";


    const response =
        result.keyPressed ||
        "—";


    const reactionTime =
        formatReactionTime(
            result.reactionTime
        );


    let resultText =
        "Incorrect";


    let resultClass =
        "bad";


    if (result.timedOut) {

        resultText =
            "No response";

        resultClass =
            "timeout";

    } else if (result.correct) {

        resultText =
            "Correct";

        resultClass =
            "ok";

    }


    return `

        <tr>

            <td>
                ${escapeHTML(trialNumber)}
            </td>

            <td>
                ${escapeHTML(stimulus)}
            </td>

            <td>
                ${escapeHTML(expected)}
            </td>

            <td>
                ${escapeHTML(
                    formatResponse(response)
                )}
            </td>

            <td>
                ${escapeHTML(reactionTime)}
            </td>

            <td class="${resultClass}">
                ${resultText}
            </td>

        </tr>

    `;

}


/* =========================================================
   7. FORMAT KEY
========================================================= */

function formatKey(key) {

    const keyNames = {

        Space: "SPACE",

        Enter: "ENTER",

        ArrowLeft:
            "LEFT ARROW",

        ArrowRight:
            "RIGHT ARROW",

        ArrowUp:
            "UP ARROW",

        ArrowDown:
            "DOWN ARROW"

    };


    return (
        keyNames[key] ||
        key
    );

}


/* =========================================================
   8. FORMAT RESPONSE
========================================================= */

function formatResponse(response) {

    if (
        response ===
        "MouseClick"
    ) {

        return "Mouse click";

    }


    if (
        response ===
        "No response"
    ) {

        return "No response";

    }


    return formatKey(
        response
    );

}


/* =========================================================
   9. RENDER TRIAL RESULTS
========================================================= */

function renderRows(data) {

    const trialResults =
        Array.isArray(
            data.trialResults
        )
            ? data.trialResults
            : [];


    if (
        trialResults.length === 0
    ) {

        rowsElement.innerHTML = `

            <tr>

                <td
                    colspan="6"
                    class="empty"
                >
                    No trial-level responses
                    are available.
                </td>

            </tr>

        `;

        return;

    }


    rowsElement.innerHTML =
        trialResults
            .map(
                result =>
                    createResultRow(
                        result
                    )
            )
            .join("");

}


/* =========================================================
   10. INITIALIZE RESULTS PAGE
========================================================= */

if (
    !resultsData ||
    !Array.isArray(
        resultsData.trialResults
    )
) {

    showEmptyState();

} else {

    updateSummary(
        resultsData
    );

    renderRows(
        resultsData
    );

}