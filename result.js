// ============================================================
// CogniLab Results API
// ============================================================


// ============================================================
// SAVE ONE TRIAL RESPONSE
// ============================================================

async function saveTrialResponse(
    sessionId,
    result
) {

    const {
        data,
        error
    } =
        await supabaseClient

            .from("trial_responses")

            .insert({

                session_id:
                    sessionId,

                trial_id:
                    result.trialId ||
                    null,

                trial_number:
                    result.trial ||
                    null,

                stimulus:
                    result.stimulus ||
                    null,

                trial_type:
                    result.trialType ||
                    null,

                response_method:
                    result.responseMethod ||
                    null,

                correct_key:
                    result.correctKey ||
                    null,

                key_pressed:
                    result.keyPressed ||
                    null,

                reaction_time_ms:
                    result.reactionTime ??
                    null,

                correct:
                    result.correct ??
                    false,

                timed_out:
                    result.timedOut ??
                    false,

                started_at:
                    result.startedAt ||
                    null,

                responded_at:
                    result.respondedAt ||
                    null

            })

            .select()

            .single();


    if (error) {
        handleSupabaseError(error);
    }


    return data;
}


// ============================================================
// SAVE COMPLETE EXPERIMENT
// ============================================================

async function saveExperimentResults(
    sessionId,
    results
) {

    if (!Array.isArray(results)) {

        throw new Error(
            "Results must be an array."
        );

    }


    for (
        const result of results
    ) {

        await saveTrialResponse(
            sessionId,
            result
        );

    }


    await completeParticipantSession(
        sessionId
    );


    return true;
}


// ============================================================
// GET EXPERIMENT RESPONSES
// ============================================================

async function getExperimentResponses(
    experimentId
) {

    const {
        data,
        error
    } =
        await supabaseClient

            .from("trial_responses")

            .select(`
                *,
                participant_sessions!inner (
                    experiment_id,
                    participant_code
                )
            `)

            .eq(
                "participant_sessions.experiment_id",
                experimentId
            )

            .order(
                "created_at",
                {
                    ascending: true
                }
            );


    if (error) {
        handleSupabaseError(error);
    }


    return data;
}


// ============================================================
// CALCULATE SUMMARY
// ============================================================

function calculateResultSummary(
    responses
) {

    const total =
        responses.length;


    const correct =
        responses.filter(
            response =>
                response.correct === true
        ).length;


    const incorrect =
        responses.filter(
            response =>
                response.correct === false
        ).length;


    const reactionTimes =
        responses

            .map(
                response =>
                    Number(
                        response.reaction_time_ms
                    )
            )

            .filter(
                value =>
                    Number.isFinite(value)
            );


    const accuracy =
        total === 0

            ? 0

            : (
                correct /
                total
            ) * 100;


    const average =
        reactionTimes.length === 0

            ? null

            : reactionTimes.reduce(
                (sum, value) =>
                    sum + value,
                0
            )
            /
            reactionTimes.length;


    const fastest =
        reactionTimes.length === 0

            ? null

            : Math.min(
                ...reactionTimes
            );


    const slowest =
        reactionTimes.length === 0

            ? null

            : Math.max(
                ...reactionTimes
            );


    return {

        total,

        correct,

        incorrect,

        accuracy,

        average,

        fastest,

        slowest

    };
}