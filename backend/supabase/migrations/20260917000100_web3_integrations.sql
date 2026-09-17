-- Migration: Web3 Integrations
-- 1. Support Ethereum addresses in citizen_wallets & link phone
-- 2. Add signature & signer_address to complaints
-- 3. Add ipfs_cid to resolutions for Pinata IPFS storage
-- 4. Update complaints_public view to expose Web3 fields

-- Temporarily drop foreign key constraints referencing citizen_wallets(wallet_id) to alter type to text
alter table public.complaints drop constraint if exists complaints_wallet_id_fkey;
alter table public.complaint_upvotes drop constraint if exists complaint_upvotes_wallet_id_fkey;
alter table public.verifications drop constraint if exists verifications_wallet_id_fkey;
alter table public.citizen_wallets drop constraint if exists citizen_wallets_wallet_id_fkey;

-- Alter column types from uuid to text (supports both existing UUIDs and Ethereum addresses 0x...)
alter table public.citizen_wallets alter column wallet_id type text;
alter table public.complaints alter column wallet_id type text;
alter table public.complaint_upvotes alter column wallet_id type text;
alter table public.verifications alter column wallet_id type text;

-- Add phone and wallet_address columns to citizen_wallets
alter table public.citizen_wallets add column if not exists phone text unique;
alter table public.citizen_wallets add column if not exists wallet_address text unique;

-- Re-attach foreign keys with text type
alter table public.complaints add constraint complaints_wallet_id_fkey 
  foreign key (wallet_id) references public.citizen_wallets(wallet_id) on delete cascade;
alter table public.complaint_upvotes add constraint complaint_upvotes_wallet_id_fkey 
  foreign key (wallet_id) references public.citizen_wallets(wallet_id) on delete cascade;
alter table public.verifications add constraint verifications_wallet_id_fkey 
  foreign key (wallet_id) references public.citizen_wallets(wallet_id) on delete cascade;

-- Add digital signature and signer address columns to complaints
alter table public.complaints add column if not exists signature text;
alter table public.complaints add column if not exists signer_address text;

-- Add Pinata IPFS CID to resolutions
alter table public.resolutions add column if not exists ipfs_cid text;

-- Recreate complaints_public view with signature and signer_address
drop view if exists public.complaints_public;
create view public.complaints_public with (security_invoker = false) as
select id, derived_citizen_id, domain_id, description, before_photo_url, lat, long,
       status, assigned_authority_id, duplicate_of, upvote_count, created_at,
       signature, signer_address
from public.complaints;

grant select on public.complaints_public to anon, authenticated;
