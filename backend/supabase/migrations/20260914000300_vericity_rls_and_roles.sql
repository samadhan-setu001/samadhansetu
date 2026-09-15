-- Allow authorities to read officers in their own authority
drop policy if exists "self read officer profile" on public.officers;
create policy "read officers" on public.officers
for select to authenticated
using (authority_id = auth.uid() or id = auth.uid());

-- Allow all users to read authorities and domain maps
drop policy if exists "self read authority profile" on public.authorities;
create policy "read authorities" on public.authorities
for select to anon, authenticated
using (true);

drop policy if exists "read domain_authority_map" on public.domain_authority_map;
create policy "read domain_authority_map" on public.domain_authority_map
for select to anon, authenticated
using (true);

-- Allow reading case assignments
drop policy if exists "authorities read case assignments" on public.case_assignments;
create policy "authorities read case assignments" on public.case_assignments
for select to authenticated
using (assigned_by = auth.uid() or officer_id = auth.uid());

-- Allow reading resolutions and verifications
drop policy if exists "read resolutions" on public.resolutions;
create policy "read resolutions" on public.resolutions
for select to anon, authenticated
using (true);

drop policy if exists "read verifications" on public.verifications;
create policy "read verifications" on public.verifications
for select to anon, authenticated
using (true);

-- Allow reading complaints across roles
drop policy if exists "citizens read own complaints" on public.complaints;
create policy "read complaints" on public.complaints
for select to anon, authenticated
using (true);

-- Ensure citizen_wallets row exists automatically for any user
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  if (coalesce(new.raw_app_meta_data->>'role', '') in ('citizen', '')) then
    insert into public.citizen_wallets (wallet_id, reputation_score)
    values (new.id, 50.00)
    on conflict (wallet_id) do nothing;
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();
