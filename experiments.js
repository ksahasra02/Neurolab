// ============================================================
// CogniLab Experiment API
// ============================================================


// ============================================================
// CREATE EXPERIMENT
// ============================================================

async function createExperiment(
    experimentData
) {

    const user =
        await getAuthenticatedUser();


    const {
        data,
        error
    } =
        await supabaseClient

            .from("experiments")

            .insert({

                researcher_id:
                    user.id,

                name:
                    experimentData.name ||
                    "Untitled Experiment",

                description:
                    experimentData.description ||
                    "",

                randomize_trials:
                    Boolean(
                        experimentData.randomizeTrials
                    ),

                randomize_stimulus:
                    Boolean(
                        experimentData.randomizeStimulus
                    ),

                status:
                    "draft"

            })

            .select()

            .single();


    if (error) {
        handleSupabaseError(error);
    }


    return data;
}


// ============================================================
// GET RESEARCHER EXPERIMENTS
// ============================================================

async function getMyExperiments() {

    const user =
        await getAuthenticatedUser();


    const {
        data,
        error
    } =
        await supabaseClient

            .from("experiments")

            .select("*")

            .eq(
                "researcher_id",
                user.id
            )

            .order(
                "created_at",
                {
                    ascending: false
                }
            );


    if (error) {
        handleSupabaseError(error);
    }


    return data;
}


// ============================================================
// GET ONE EXPERIMENT
// ============================================================

async function getExperiment(
    experimentId
) {

    const {
        data,
        error
    } =
        await supabaseClient

            .from("experiments")

            .select("*")

            .eq("id", experimentId)

            .single();


    if (error) {
        handleSupabaseError(error);
    }


    return data;
}


// ============================================================
// GET EXPERIMENT + TRIALS
// ============================================================

async function getExperimentWithTrials(
    experimentId
) {

    const experiment =
        await getExperiment(
            experimentId
        );


    const {
        data: trials,
        error
    } =
        await supabaseClient

            .from("trials")

            .select("*")

            .eq(
                "experiment_id",
                experimentId
            )

            .order(
                "trial_order",
                {
                    ascending: true
                }
            );


    if (error) {
        handleSupabaseError(error);
    }


    return {

        ...experiment,

        trials

    };
}


// ============================================================
// UPDATE EXPERIMENT
// ============================================================

async function updateExperiment(
    experimentId,
    updates
) {

    const {
        data,
        error
    } =
        await supabaseClient

            .from("experiments")

            .update(updates)

            .eq("id", experimentId)

            .select()

            .single();


    if (error) {
        handleSupabaseError(error);
    }


    return data;
}


// ============================================================
// DELETE EXPERIMENT
// ============================================================

async function deleteExperiment(
    experimentId
) {

    const {
        error
    } =
        await supabaseClient

            .from("experiments")

            .delete()

            .eq(
                "id",
                experimentId
            );


    if (error) {
        handleSupabaseError(error);
    }


    return true;
}


// ============================================================
// CREATE TRIAL
// ============================================================

async function createTrial(
    experimentId,
    trialData
) {

    const {
        data,
        error
    } =
        await supabaseClient

            .from("trials")

            .insert({

                experiment_id:
                    experimentId,

                trial_order:
                    Number(
                        trialData.trialOrder ?? 0
                    ),

                name:
                    trialData.name ||
                    "New Trial",

                trial_type:
                    trialData.type ||
                    "reaction",

                stimulus_type:
                    trialData.stimulus ||
                    "circle",

                description:
                    trialData.description ||
                    "",

                delay_ms:
                    Number(
                        trialData.delay ?? 1000
                    ),

                duration_ms:
                    Number(
                        trialData.duration ?? 500
                    ),

                response_method:
                    trialData.responseMethod ||
                    "keyboard",

                correct_key:
                    trialData.correctKey ||
                    "Space",

                correct_next:
                    trialData.correctNext ||
                    null,

                incorrect_next:
                    trialData.incorrectNext ||
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
// UPDATE TRIAL
// ============================================================

async function updateTrial(
    trialId,
    updates
) {

    const {
        data,
        error
    } =
        await supabaseClient

            .from("trials")

            .update(updates)

            .eq(
                "id",
                trialId
            )

            .select()

            .single();


    if (error) {
        handleSupabaseError(error);
    }


    return data;
}


// ============================================================
// DELETE TRIAL
// ============================================================

async function deleteTrial(
    trialId
) {

    const {
        error
    } =
        await supabaseClient

            .from("trials")

            .delete()

            .eq(
                "id",
                trialId
            );


    if (error) {
        handleSupabaseError(error);
    }


    return true;
}


// ============================================================
// PUBLISH EXPERIMENT
// ============================================================

async function publishExperiment(
    experimentId
) {

    const publicCode =
        generatePublicCode();


    const {
        data,
        error
    } =
        await supabaseClient

            .from("experiments")

            .update({

                status:
                    "published",

                public_code:
                    publicCode,

                published_at:
                    new Date().toISOString()

            })

            .eq(
                "id",
                experimentId
            )

            .select()

            .single();


    if (error) {
        handleSupabaseError(error);
    }


    return data;
}


// ============================================================
// GET PUBLIC EXPERIMENT
// ============================================================

async function getPublicExperiment(
    publicCode
) {

    const {
        data: experiment,
        error: experimentError
    } =
        await supabaseClient

            .from("experiments")

            .select("*")

            .eq(
                "public_code",
                publicCode
            )

            .eq(
                "status",
                "published"
            )

            .single();


    if (experimentError) {
        handleSupabaseError(
            experimentError
        );
    }


    const {
        data: trials,
        error: trialError
    } =
        await supabaseClient

            .from("trials")

            .select("*")

            .eq(
                "experiment_id",
                experiment.id
            )

            .order(
                "trial_order",
                {
                    ascending: true
                }
            );


    if (trialError) {
        handleSupabaseError(
            trialError
        );
    }


    return {

        ...experiment,

        trials

    };
}