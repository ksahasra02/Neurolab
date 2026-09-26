// ============================================================
// CogniLab Researcher API
// ============================================================


// ============================================================
// GET PROFILE
// ============================================================

async function getResearcherProfile() {

    const user =
        await getAuthenticatedUser();


    const {
        data,
        error
    } =
        await supabaseClient

            .from("profiles")

            .select("*")

            .eq("id", user.id)

            .single();


    if (error) {
        handleSupabaseError(error);
    }


    return data;
}


// ============================================================
// UPDATE PROFILE
// ============================================================

async function updateResearcherProfile(
    updates
) {

    const user =
        await getAuthenticatedUser();


    const {
        data,
        error
    } =
        await supabaseClient

            .from("profiles")

            .update(updates)

            .eq("id", user.id)

            .select()

            .single();


    if (error) {
        handleSupabaseError(error);
    }


    return data;
}