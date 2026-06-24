-- SQL Schema for Dow Chemical SDS Compliance System
-- Paste this script into the Supabase SQL Editor (https://supabase.com/dashboard/project/lwvrejloimuvaravltfd/sql/new)

-- 1. Vendors Table
CREATE TABLE IF NOT EXISTS public.vendors (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    contact TEXT,
    request_date DATE,
    last_response_date DATE,
    status TEXT DEFAULT 'Pending',
    compliance_status TEXT DEFAULT 'Pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS & Select policy for easy access
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read" ON public.vendors FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON public.vendors FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON public.vendors FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow public delete" ON public.vendors FOR DELETE USING (true);

-- 2. SDS Documents Table
CREATE TABLE IF NOT EXISTS public.sds_documents (
    id TEXT PRIMARY KEY,
    vendor_name TEXT NOT NULL,
    file_name TEXT NOT NULL,
    received_date DATE,
    product_name TEXT,
    emergency_phone TEXT,
    revision_date TEXT,
    ghs_classification TEXT,
    processing_status TEXT DEFAULT 'Pending',
    failure_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.sds_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read sds" ON public.sds_documents FOR SELECT USING (true);
CREATE POLICY "Allow public insert sds" ON public.sds_documents FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update sds" ON public.sds_documents FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow public delete sds" ON public.sds_documents FOR DELETE USING (true);

-- 3. Portal Users Table (For login syncing)
CREATE TABLE IF NOT EXISTS public.users (
    email TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    avatar TEXT,
    role TEXT,
    provider TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read users" ON public.users FOR SELECT USING (true);
CREATE POLICY "Allow public insert users" ON public.users FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update users" ON public.users FOR UPDATE USING (true) WITH CHECK (true);
-- 4. Vendor Logins Table
CREATE TABLE IF NOT EXISTS public.vendor_logins (
    id TEXT PRIMARY KEY,
    vendor_id TEXT NOT NULL REFERENCES public.vendors(id),
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.vendor_logins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read vendor_logins" ON public.vendor_logins FOR SELECT USING (true);
CREATE POLICY "Allow public insert vendor_logins" ON public.vendor_logins FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update vendor_logins" ON public.vendor_logins FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow public delete vendor_logins" ON public.vendor_logins FOR DELETE USING (true);

