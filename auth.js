// ============================================================
// CogniLab Authentication
// ============================================================


const supabaseClient =
    window.supabase.createClient(

        window.COGNILAB_CONFIG.SUPABASE_URL,

        window.COGNILAB_CONFIG.SUPABASE_ANON_KEY

    );


// ============================================================
// SIGN UP
// ============================================================

async function signUp(
    email,
    password,
    fullName = ""
) {

    const {
        data,
        error
    } = await supabaseClient.auth.signUp({

        email,

        password,

        options: {

            data: {
                full_name: fullName
            }

        }

    });


    if (error) {
        throw error;
    }


    return data;
}


// ============================================================
// LOGIN
// ============================================================

async function login(
    email,
    password
) {

    const {
        data,
        error
    } =
        await supabaseClient.auth
            .signInWithPassword({

                email,

                password

            });


    if (error) {
        throw error;
    }


    return data;
}


// ============================================================
// LOGOUT
// ============================================================

async function logout() {

    const {
        error
    } =
        await supabaseClient.auth.signOut();


    if (error) {
        throw error;
    }


    window.location.href =
        "login.html";
}


// ============================================================
// GET CURRENT USER
// ============================================================

async function getCurrentUser() {

    const {
        data,
        error
    } =
        await supabaseClient.auth.getUser();


    if (error) {
        throw error;
    }


    return data.user;
}


// ============================================================
// REQUIRE AUTHENTICATION
// ============================================================

async function requireResearcher() {

    const user =
        await getCurrentUser();


    if (!user) {

        window.location.href =
            "login.html";

        return null;
    }


    return user;
}