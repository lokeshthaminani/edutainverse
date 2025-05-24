/*
  # Disable RLS policies for development

  1. Changes
    - Disable RLS on all tables for development purposes
    - This allows unrestricted access to tables during development
    
  WARNING: Only use this in development! Re-enable RLS before deploying to production.
*/

-- Disable RLS on users table
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Disable RLS on courses table
ALTER TABLE courses DISABLE ROW LEVEL SECURITY;

-- Disable RLS on modules table
ALTER TABLE modules DISABLE ROW LEVEL SECURITY;

-- Disable RLS on videos table
ALTER TABLE videos DISABLE ROW LEVEL SECURITY;

-- Disable RLS on enrollments table
ALTER TABLE enrollments DISABLE ROW LEVEL SECURITY;

-- Disable RLS on progress table
ALTER TABLE progress DISABLE ROW LEVEL SECURITY;