-- ==============================================================
-- AIMA-ICRC India Case League 2026
-- Supabase Migration: Production-Hardened public.profiles Table
-- (Fixes infinite recursion using SECURITY DEFINER helper functions)
-- ==============================================================

-- 1. Create public.profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL CHECK (role IN (
        'admin', 
        'student', 
        'team_leader', 
        'team_member', 
        'evaluator', 
        'institute_coordinator', 
        'regional_hub', 
        'corporate_partner'
    )),
    name TEXT NOT NULL,
    mobile TEXT,
    organization_name TEXT,
    registration_number TEXT,
    program TEXT,
    semester TEXT,
    enrolment_number TEXT,
    is_team_leader BOOLEAN DEFAULT FALSE,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Indexes for optimal query performance
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_reg_number ON public.profiles(registration_number);
CREATE INDEX IF NOT EXISTS idx_profiles_org ON public.profiles(organization_name);

-- 3. Prevent Privilege Escalation Trigger
-- Ensures a regular user CANNOT change their own role or registration_number
CREATE OR REPLACE FUNCTION public.prevent_profile_role_escalation()
RETURNS TRIGGER AS $$
BEGIN
    -- Allow service_role to make any update
    IF (auth.jwt() ->> 'role' = 'service_role') THEN
        RETURN NEW;
    END IF;

    -- If caller is not service_role, forbid changing role or registration_number
    IF (OLD.role IS DISTINCT FROM NEW.role) THEN
        RAISE EXCEPTION 'Privilege escalation rejected: users cannot modify their own assigned role.';
    END IF;

    IF (OLD.registration_number IS DISTINCT FROM NEW.registration_number) THEN
        RAISE EXCEPTION 'Modification rejected: registration_number cannot be modified.';
    END IF;

    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_prevent_role_escalation ON public.profiles;
CREATE TRIGGER trg_prevent_role_escalation
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.prevent_profile_role_escalation();

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 5. Helper Functions with SECURITY DEFINER to prevent RLS recursion
CREATE OR REPLACE FUNCTION public.get_auth_role()
RETURNS text AS $$
    SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.get_auth_org()
RETURNS text AS $$
    SELECT organization_name FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- 6. Hardened Least-Privilege RLS Policies

-- Policy A: Full access to backend Service Role
DROP POLICY IF EXISTS "Service role has full management access" ON public.profiles;
CREATE POLICY "Service role has full management access" 
    ON public.profiles FOR ALL 
    USING (auth.jwt() ->> 'role' = 'service_role')
    WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- Policy B: Each user can view their own profile
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
CREATE POLICY "Users can read own profile" 
    ON public.profiles FOR SELECT 
    USING (auth.uid() = id);

-- Policy C: Admins can read all profiles (uses SECURITY DEFINER helper to prevent recursion)
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles" 
    ON public.profiles FOR SELECT 
    USING (
        public.get_auth_role() = 'admin'
    );

-- Policy D: Institute coordinators can view student profiles belonging to their institution
DROP POLICY IF EXISTS "Institutes can view student profiles in their institution" ON public.profiles;
CREATE POLICY "Institutes can view student profiles in their institution" 
    ON public.profiles FOR SELECT 
    USING (
        public.get_auth_role() = 'institute_coordinator'
        AND organization_name IS NOT NULL
        AND organization_name = public.get_auth_org()
    );

-- Policy E: Evaluators can view participant profiles
DROP POLICY IF EXISTS "Evaluators can view participant profiles" ON public.profiles;
CREATE POLICY "Evaluators can view participant profiles" 
    ON public.profiles FOR SELECT 
    USING (
        public.get_auth_role() = 'evaluator'
    );

-- Policy F: Users can update only their own profile (trigger ensures role cannot be changed)
DROP POLICY IF EXISTS "Users can update own profile non-privileged fields" ON public.profiles;
CREATE POLICY "Users can update own profile non-privileged fields" 
    ON public.profiles FOR UPDATE 
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Revoke dangerous direct permissions from anon
REVOKE INSERT, UPDATE, DELETE ON public.profiles FROM anon;
GRANT SELECT ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
