-- ============================================================
-- CogniLab Development Seed
-- ============================================================

-- Replace this UUID with the UUID of your Supabase user.

insert into public.experiments (

    researcher_id,

    name,

    description,

    status,

    randomize_trials,

    randomize_stimulus,

    public_code,

    published_at

)

values (

    'YOUR-USER-UUID-HERE',

    'Demo Reaction Time Study',

    'Measure participant reaction time to visual stimuli.',

    'published',

    false,

    false,

    'demo-reaction-001',

    now()

);