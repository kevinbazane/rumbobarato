-- RumboBarato — Base de datos (Supabase → SQL Editor → New query → pegar y Run).
-- Se puede ejecutar más de una vez sin romper nada.

-- ---------------------------------------------------------------------------
-- Perfiles: uno por usuario. premium_hasta = fin del periodo pagado.
-- ---------------------------------------------------------------------------
create table if not exists public.perfiles (
  id uuid primary key references auth.users on delete cascade,
  email text,
  nombre text,
  premium_hasta timestamptz,
  creado_en timestamptz not null default now()
);
alter table public.perfiles enable row level security;

drop policy if exists "ver mi perfil" on public.perfiles;
create policy "ver mi perfil" on public.perfiles for select using (auth.uid() = id);

create or replace function public.crear_perfil() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.perfiles (id, email, nombre)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'))
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists al_crear_usuario on auth.users;
create trigger al_crear_usuario after insert on auth.users
  for each row execute function public.crear_perfil();

-- Premium vigente = periodo pagado + 3 días de tolerancia.
create or replace function public.tiene_premium() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.perfiles
    where id = auth.uid() and premium_hasta + interval '3 days' > now()
  );
$$;

-- ---------------------------------------------------------------------------
-- Ofertas: las publica Apps Script (vía /api/ofertas con la clave secreta).
-- ---------------------------------------------------------------------------
create table if not exists public.ofertas (
  id uuid primary key default gen_random_uuid(),
  codigo text not null unique,            -- id corto para el link: /o/{codigo}
  clave text not null unique,             -- origen|destino|ida|vuelta (anti-duplicados)
  alcance text not null check (alcance in ('nacional', 'internacional')),
  origen_codigo text,
  origen_nombre text not null,
  destino_codigo text,
  destino_nombre text not null,
  precio numeric(10, 2) not null,
  moneda text not null default 'PEN',
  fecha_ida date not null,
  fecha_vuelta date not null,
  escalas int not null default 0,
  aerolinea text not null,
  link_google_flights text not null,
  imagenes jsonb not null default '[]',   -- [{ url, credito, enlace }]
  creado_en timestamptz not null default now()
);
create index if not exists ofertas_recientes on public.ofertas (alcance, creado_en desc);
alter table public.ofertas enable row level security;

drop policy if exists "nacionales públicas" on public.ofertas;
create policy "nacionales públicas" on public.ofertas for select using (alcance = 'nacional');
drop policy if exists "internacionales premium" on public.ofertas;
create policy "internacionales premium" on public.ofertas for select
  using (alcance = 'internacional' and public.tiene_premium());

-- ---------------------------------------------------------------------------
-- Pagos aprobados (Mercado Pago: tarjeta, Yape, etc.). id = id del pago en MP.
-- ---------------------------------------------------------------------------
create table if not exists public.pagos (
  id text primary key,
  usuario_id uuid not null references public.perfiles (id) on delete cascade,
  monto numeric(10, 2) not null,
  moneda text not null,
  metodo text,
  periodo_desde timestamptz not null,
  periodo_hasta timestamptz not null,
  detalle jsonb,
  creado_en timestamptz not null default now()
);
alter table public.pagos enable row level security;

drop policy if exists "ver mis pagos" on public.pagos;
create policy "ver mis pagos" on public.pagos for select using (auth.uid() = usuario_id);

-- Registra un pago aprobado y extiende el Premium. Es idempotente: si Mercado Pago
-- avisa dos veces del mismo pago, solo cuenta una vez.
-- Si el plan sigue vigente, los días se suman al final; si ya venció, cuentan desde hoy.
create or replace function public.registrar_pago_aprobado(
  p_id text, p_usuario uuid, p_monto numeric, p_moneda text, p_metodo text,
  p_detalle jsonb, p_dias int
) returns timestamptz
language plpgsql security definer set search_path = public as $$
declare
  v_actual timestamptz;
  v_desde timestamptz;
  v_hasta timestamptz;
  v_insertado text;
begin
  select premium_hasta into v_actual from public.perfiles where id = p_usuario for update;
  if not found then
    raise exception 'Usuario % no existe', p_usuario;
  end if;

  v_desde := greatest(coalesce(v_actual, now()), now());
  v_hasta := v_desde + make_interval(days => p_dias);

  insert into public.pagos (id, usuario_id, monto, moneda, metodo, periodo_desde, periodo_hasta, detalle)
  values (p_id, p_usuario, p_monto, p_moneda, p_metodo, v_desde, v_hasta, p_detalle)
  on conflict (id) do nothing
  returning id into v_insertado;

  if v_insertado is null then
    return v_actual;  -- pago ya registrado antes
  end if;

  update public.perfiles set premium_hasta = v_hasta where id = p_usuario;
  return v_hasta;
end $$;

revoke execute on function public.registrar_pago_aprobado(text, uuid, numeric, text, text, jsonb, int)
  from public, anon, authenticated;
