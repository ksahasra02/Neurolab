// ============================================================
// CogniLab API Helpers
// ============================================================


// ============================================================
// GET AUTHENTICATED USER
// ============================================================

async function getAuthenticatedUser() {

    const {
        data,
        error
    } =
        await supabaseClient.auth.getUser();


    if (error) {
        throw error;
    }


    if (!data.user) {

        throw new Error(
            "User is not authenticated."
        );

    }


    return data.user;
}


// ============================================================
// GENERATE PUBLIC EXPERIMENT CODE
// ============================================================

function generatePublicCode() {

    const characters =
        "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";


    let code = "";


    for (let i = 0; i < 12; i++) {

        const index =
            Math.floor(
                Math.random() *
                characters.length
            );


        code +=
            characters[index];

    }


    return code;
}


// ============================================================
// GENERATE PARTICIPANT CODE
// ============================================================

function generateParticipantCode() {

    const characters =
        "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";


    let code = "P-";


    for (let i = 0; i < 8; i++) {

        const index =
            Math.floor(
                Math.random() *
                characters.length
            );


        code +=
            characters[index];

    }


    return code;
}


// ============================================================
// SUPABASE ERROR HANDLER
// ============================================================

function handleSupabaseError(error) {

    console.error(
        "CogniLab Supabase Error:",
        error
    );


    throw new Error(

        error?.message ||

        "A database error occurred."

    );
}