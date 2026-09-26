// ============================================================
// CogniLab Participant API
// ============================================================


// ============================================================
// CREATE PARTICIPANT SESSION
// ============================================================

async function createParticipantSession(
    experimentId
) {

    const participantCode =
        generateParticipantCode();


    const {
        data,
        error
    } =
        await supabaseClient

            .from("participant_sessions")

            .insert({

                experiment_id:
                    experimentId,

                participant_code:
                    participantCode,

                user_agent:
                    navigator.userAgent,

                metadata: {}

            })

            .select()

            .single();


    if (error) {
        handleSupabaseError(error);
    }


    return data;
}


// ============================================================
// COMPLETE SESSION
// ============================================================

async function completeParticipantSession(
    sessionId
) {

    const {
        data,
        error
    } =
        await supabaseClient

            .from("participant_sessions")

            .update({

                completed_at:
                    new Date().toISOString()

            })

            .eq(
                "id",
                sessionId
            )

            .select()

            .single();


    if (error) {
        handleSupabaseError(error);
    }


    return data;
}