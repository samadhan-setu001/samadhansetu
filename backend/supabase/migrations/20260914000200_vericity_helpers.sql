-- Haversine distance in metres; avoids a PostGIS dependency for the prototype.
create or replace function public.distance_meters(lat1 numeric, lon1 numeric, lat2 numeric, lon2 numeric)
returns numeric language sql immutable strict as $$
  select 6371000 * acos(least(1, greatest(-1,
    cos(radians(lat1::double precision)) * cos(radians(lat2::double precision)) *
    cos(radians(lon2::double precision) - radians(lon1::double precision)) +
    sin(radians(lat1::double precision)) * sin(radians(lat2::double precision))
  )))
$$;

create or replace function public.nearby_complaints(p_domain_id uuid, p_lat numeric, p_long numeric)
returns table (id uuid, domain_id uuid, description text, before_photo_url text, lat numeric, long numeric, status public.complaint_status, created_at timestamptz, distance_meters numeric)
language sql stable security definer set search_path = public as $$
  select c.id, c.domain_id, c.description, c.before_photo_url, c.lat, c.long, c.status, c.created_at,
         public.distance_meters(p_lat, p_long, c.lat, c.long) as distance_meters
  from public.complaints c
  where c.domain_id = p_domain_id
    and c.status <> 'resolved'
    and c.created_at > now() - interval '30 days'
    and public.distance_meters(p_lat, p_long, c.lat, c.long) <= 75
  order by distance_meters asc;
$$;

revoke all on function public.nearby_complaints(uuid, numeric, numeric) from public;
grant execute on function public.nearby_complaints(uuid, numeric, numeric) to authenticated;

create or replace function public.increment_upvote(complaint_uuid uuid)
returns void language sql security definer set search_path = public as $$
  update public.complaints set upvote_count = upvote_count + 1 where id = complaint_uuid;
$$;

create or replace function public.adjust_reputation(target_wallet uuid, delta numeric)
returns void language sql security definer set search_path = public as $$
  update public.citizen_wallets
  set reputation_score = greatest(0, least(100, reputation_score + delta))
  where wallet_id = target_wallet;
$$;

revoke all on function public.increment_upvote(uuid) from public;
revoke all on function public.adjust_reputation(uuid, numeric) from public;
