import { estadoPlan, type TipoEstadoPlan } from './plan.ts';

export interface PerfilCliente {
  id: string;
  email: string | null;
  nombre: string | null;
  whatsapp?: string | null;
  acepta_promos?: boolean | null;
  promos_aceptadas_en?: string | null;
  premium_hasta: string | null;
}

export interface PagoCliente {
  usuario_id: string;
  monto: number | string;
  metodo: string | null;
  creado_en: string;
}

export interface Cliente {
  nombre: string;
  email: string;
  whatsapp: string;
  estado: TipoEstadoPlan;
  /** true si hoy puede ver las ofertas Premium (activo, por vencer o en tolerancia). */
  acceso_premium: boolean;
  /** true si tiene acceso Premium Y aceptó promociones Y dejó su WhatsApp. */
  enviar_ofertas: boolean;
  acepta_promos: boolean;
  promos_aceptadas_en: string | null;
  premium_hasta: string | null;
  acceso_hasta: string | null;
  cantidad_pagos: number;
  total_pagado: number;
  ultimo_pago: string | null;
  ultimo_medio: string;
}

/** Une perfiles y pagos en la lista de clientes (quienes pagaron al menos una vez). */
export function armarClientes(perfiles: PerfilCliente[], pagos: PagoCliente[], ahora: Date = new Date()): Cliente[] {
  const porUsuario = new Map<string, PagoCliente[]>();
  for (const p of pagos) {
    const lista = porUsuario.get(p.usuario_id) ?? [];
    lista.push(p);
    porUsuario.set(p.usuario_id, lista);
  }

  const clientes: Cliente[] = [];
  for (const perfil of perfiles) {
    const suyos = porUsuario.get(perfil.id);
    if (!suyos?.length) continue;
    suyos.sort((a, b) => b.creado_en.localeCompare(a.creado_en));
    const plan = estadoPlan(perfil.premium_hasta, ahora);
    const whatsapp = perfil.whatsapp ?? '';
    const acepta = perfil.acepta_promos === true;
    clientes.push({
      nombre: perfil.nombre ?? '',
      email: perfil.email ?? '',
      whatsapp,
      estado: plan.tipo,
      acceso_premium: plan.accesoPremium,
      enviar_ofertas: plan.accesoPremium && acepta && !!whatsapp,
      acepta_promos: acepta,
      promos_aceptadas_en: perfil.promos_aceptadas_en ?? null,
      premium_hasta: plan.premiumHasta?.toISOString() ?? null,
      acceso_hasta: plan.toleranciaHasta?.toISOString() ?? null,
      cantidad_pagos: suyos.length,
      total_pagado: Math.round(suyos.reduce((s, p) => s + Number(p.monto), 0) * 100) / 100,
      ultimo_pago: suyos[0].creado_en,
      ultimo_medio: suyos[0].metodo ?? '',
    });
  }
  // Primero los que tienen acceso; dentro de cada grupo, los que vencen más tarde.
  return clientes.sort(
    (a, b) => Number(b.acceso_premium) - Number(a.acceso_premium) || (b.premium_hasta ?? '').localeCompare(a.premium_hasta ?? ''),
  );
}
