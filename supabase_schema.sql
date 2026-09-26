-- ============================================================
-- CogniLab Database
-- ============================================================

create extension if not exists pgcrypto;


-- ============================================================
-- PROFILES
-- ============================================================

create table if not exists public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,

    email text,

    full_name text,

    role text not null default 'researcher'
        check (role in ('researcher', 'admin')),

    created_at timestamptz not null default now()
);


-- ============================================================
-- EXPERIMENTS
-- ============================================================

create table if not exists public.experiments (

    id uuid primary key default gen_random_uuid(),

    researcher_id uuid not null
        references public.profiles(id)
        on delete cascade,

    name text not null,

    description text default '',

    status text not null default 'draft'
        check (
            status in (
                'draft',
                'published',
                'archived'
            )
        ),

    randomize_trials boolean not null default false,

    randomize_stimulus boolean not null default false,

    public_code text unique,

    created_at timestamptz not null default now(),

    updated_at timestamptz not null default now(),

    published_at timestamptz
);


-- ============================================================
-- TRIALS
-- ============================================================

create table if not exists public.trials (

    id uuid primary key default gen_random_uuid(),

    experiment_id uuid not null
        references public.experiments(id)
        on delete cascade,

    trial_order integer not null default 0,

    name text not null,

    trial_type text not null default 'reaction'
        check (
            trial_type in (
                'reaction',
                'choice',
                'instruction'
            )
        ),

    stimulus_type text not null default 'circle',

    description text default '',

    delay_ms integer not null default 1000,

    duration_ms integer not null default 500,

    response_method text not null default 'keyboard'
        check (
            response_method in (
                'keyboard',
                'mouse'
            )
        ),

    correct_key text,

    correct_next uuid
        references public.trials(id)
        on delete set null,

    incorrect_next uuid
        references public.trials(id)
        on delete set null,

    created_at timestamptz not null default now(),

    updated_at timestamptz not null default now()
);


-- ============================================================
-- PARTICIPANT SESSIONS
-- ============================================================

create table if not exists public.participant_sessions (

    id uuid primary key default gen_random_uuid(),

    experiment_id uuid not null
        references public.experiments(id)
        on delete cascade,

    participant_code text not null,

    started_at timestamptz not null default now(),

    completed_at timestamptz,

    user_agent text,

    metadata jsonb not null default '{}'::jsonb
);


-- ============================================================
-- TRIAL RESPONSES
-- ============================================================

create table if not exists public.trial_responses (

    id uuid primary key default gen_random_uuid(),

    session_id uuid not null
        references public.participant_sessions(id)
        on delete cascade,

    trial_id uuid
        references public.trials(id)
        on delete set null,

    trial_number integer,

    stimulus text,

    trial_type text,

    response_method text,

    correct_key text,

    key_pressed text,

    reaction_time_ms numeric,

    correct boolean,

    timed_out boolean not null default false,

    started_at timestamptz,

    responded_at timestamptz,

    created_at timestamptz not null default now()
);


-- ============================================================
-- INDEXES
-- ============================================================

create index if not exists
idx_experiments_researcher
on public.experiments(researcher_id);


create index if not exists
idx_experiments_public_code
on public.experiments(public_code);


create index if not exists
idx_trials_experiment
on public.trials(experiment_id);


create index if not exists
idx_sessions_experiment
on public.participant_sessions(experiment_id);


create index if not exists
idx_responses_session
on public.trial_responses(session_id);


-- ============================================================
-- UPDATED_AT FUNCTION
-- ============================================================

create or replace function public.update_timestamp()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;


-- ============================================================
-- EXPERIMENT UPDATED TRIGGER
-- ============================================================

drop trigger if exists experiments_updated_at
on public.experiments;


create trigger experiments_updated_at

before update
on public.experiments

for each row

execute function public.update_timestamp();


-- ============================================================
-- TRIAL UPDATED TRIGGER
-- ============================================================

drop trigger if exists trials_updated_at
on public.trials;


create trigger trials_updated_at

before update
on public.trials

for each row

execute function public.update_timestamp();


-- ============================================================
-- AUTOMATIC PROFILE CREATION
-- ============================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$

begin

    insert into public.profiles (
        id,
        email
    )

    values (
        new.id,
        new.email
    )

    on conflict (id)
    do nothing;

    return new;

end;

$$;


drop trigger if exists on_auth_user_created
on auth.users;


create trigger on_auth_user_created

after insert
on auth.users

for each row

execute function public.handle_new_user();


-- ============================================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================================

alter table public.profiles
enable row level security;

alter table public.experiments
enable row level security;

alter table public.trials
enable row level security;

alter table public.participant_sessions
enable row level security;

alter table public.trial_responses
enable row level security;


-- ============================================================
-- PROFILE POLICIES
-- ============================================================

drop policy if exists
"Users can view own profile"
on public.profiles;


create policy
"Users can view own profile"

on public.profiles

for select

to authenticated

using (
    id = auth.uid()
);


drop policy if exists
"Users can update own profile"
on public.profiles;


create policy
"Users can update own profile"

on public.profiles

for update

to authenticated

using (
    id = auth.uid()
)

with check (
    id = auth.uid()
);


-- ============================================================
-- EXPERIMENT POLICIES
-- ============================================================

drop policy if exists
"Researchers can view own experiments"
on public.experiments;


create policy
"Researchers can view own experiments"

on public.experiments

for select

to authenticated

using (
    researcher_id = auth.uid()
);


drop policy if exists
"Researchers can create experiments"
on public.experiments;


create policy
"Researchers can create experiments"

on public.experiments

for insert

to authenticated

with check (
    researcher_id = auth.uid()
);


drop policy if exists
"Researchers can update own experiments"
on public.experiments;


create policy
"Researchers can update own experiments"

on public.experiments

for update

to authenticated

using (
    researcher_id = auth.uid()
)

with check (
    researcher_id = auth.uid()
);


drop policy if exists
"Researchers can delete own experiments"
on public.experiments;


create policy
"Researchers can delete own experiments"

on public.experiments

for delete

to authenticated

using (
    researcher_id = auth.uid()
);


-- ============================================================
-- PUBLIC EXPERIMENT ACCESS
-- ============================================================

drop policy if exists
"Public can view published experiments"
on public.experiments;


create policy
"Public can view published experiments"

on public.experiments

for select

to anon

using (
    status = 'published'
);


-- ============================================================
-- TRIAL POLICIES
-- ============================================================

drop policy if exists
"Researchers can view own trials"
on public.trials;


create policy
"Researchers can view own trials"

on public.trials

for select

to authenticated

using (
    exists (
        select 1
        from public.experiments e
        where e.id = trials.experiment_id
        and e.researcher_id = auth.uid()
    )
);


drop policy if exists
"Researchers can create trials"
on public.trials;


create policy
"Researchers can create trials"

on public.trials

for insert

to authenticated

with check (
    exists (
        select 1
        from public.experiments e
        where e.id = trials.experiment_id
        and e.researcher_id = auth.uid()
    )
);


drop policy if exists
"Researchers can update own trials"
on public.trials;


create policy
"Researchers can update own trials"

on public.trials

for update

to authenticated

using (
    exists (
        select 1
        from public.experiments e
        where e.id = trials.experiment_id
        and e.researcher_id = auth.uid()
    )
)

with check (
    exists (
        select 1
        from public.experiments e
        where e.id = trials.experiment_id
        and e.researcher_id = auth.uid()
    )
);


drop policy if exists
"Researchers can delete own trials"
on public.trials;


create policy
"Researchers can delete own trials"

on public.trials

for delete

to authenticated

using (
    exists (
        select 1
        from public.experiments e
        where e.id = trials.experiment_id
        and e.researcher_id = auth.uid()
    )
);


-- ============================================================
-- PUBLIC TRIAL ACCESS
-- ============================================================

drop policy if exists
"Public can view published trials"
on public.trials;


create policy
"Public can view published trials"

on public.trials

for select

to anon

using (
    exists (
        select 1
        from public.experiments e
        where e.id = trials.experiment_id
        and e.status = 'published'
    )
);


-- ============================================================
-- PARTICIPANT SESSION POLICIES
-- ============================================================

drop policy if exists
"Public can create participant sessions"
on public.participant_sessions;


create policy
"Public can create participant sessions"

on public.participant_sessions

for insert

to anon

with check (
    exists (
        select 1
        from public.experiments e
        where e.id = participant_sessions.experiment_id
        and e.status = 'published'
    )
);


drop policy if exists
"Researchers can view own participant sessions"
on public.participant_sessions;


create policy
"Researchers can view own participant sessions"

on public.participant_sessions

for select

to authenticated

using (
    exists (
        select 1
        from public.experiments e
        where e.id = participant_sessions.experiment_id
        and e.researcher_id = auth.uid()
    )
);


-- ============================================================
-- RESPONSE POLICIES
-- ============================================================

drop policy if exists
"Public can submit responses"
on public.trial_responses;


create policy
"Public can submit responses"

on public.trial_responses

for insert

to anon

with check (

    exists (

        select 1

        from public.participant_sessions ps

        join public.experiments e
        on e.id = ps.experiment_id

        where ps.id = trial_responses.session_id

        and e.status = 'published'
    )

);


drop policy if exists
"Researchers can view own responses"
on public.trial_responses;


create policy
"Researchers can view own responses"

on public.trial_responses

for select

to authenticated

using (

    exists (

        select 1

        from public.participant_sessions ps

        join public.experiments e
        on e.id = ps.experiment_id

        where ps.id = trial_responses.session_id

        and e.researcher_id = auth.uid()

    )

);