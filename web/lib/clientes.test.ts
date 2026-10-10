import { test } from 'node:test';
import assert from 'node:assert/strict';
import { armarClientes, type PagoCliente, type PerfilCliente } from './clientes.ts';

const ahora = new Date('2026-10-10T12:00:00Z');
const DIA = 86400000;
const en = (dias: number) => new Date(ahora.getTime() + dias * DIA).toISOString();

const perfil = (id: string, dias: number | null, extra: Partial<PerfilCliente> = {}): PerfilCliente => ({
  id, email: `${id}@correo.pe`, nombre: id, premium_hasta: dias === null ? null : en(dias),
  whatsapp: '+51987654321', acepta_promos: true, ...extra,
});
const pago = (usuario_id: string, dias: number, metodo = 'yape'): PagoCliente => ({ usuario_id, monto: '9.90', metodo, creado_en: en(dias) });

test('estado de cada cliente y quién recibe ofertas', () => {
  const lista = armarClientes(
    [
      perfil('activa', 20),
      perfil('porvencer', 2),
      perfil('tolerancia', -1),
      perfil('vencida', -10),
      perfil('sinpermiso', 15, { acepta_promos: false }),
      perfil('sinnumero', 15, { whatsapp: null }),
      perfil('nuncapago', 15),
    ],
    [pago('activa', -10), pago('porvencer', -28), pago('tolerancia', -31, 'visa'), pago('vencida', -40),
     pago('sinpermiso', -15), pago('sinnumero', -15)],
    ahora,
  );
  const por = Object.fromEntries(lista.map((c) => [c.nombre, c]));

  assert.equal(por.nuncapago, undefined, 'sin pagos no es cliente');
  assert.equal(por.activa.estado, 'activo');
  assert.equal(por.porvencer.estado, 'por_vencer');
  assert.equal(por.tolerancia.estado, 'tolerancia');
  assert.equal(por.vencida.estado, 'vencido');

  assert.deepEqual(
    lista.filter((c) => c.enviar_ofertas).map((c) => c.nombre).sort(),
    ['activa', 'porvencer', 'tolerancia'],
  );
  assert.equal(por.vencida.enviar_ofertas, false, 'vencido: no');
  assert.equal(por.sinpermiso.enviar_ofertas, false, 'sin permiso: no');
  assert.equal(por.sinnumero.enviar_ofertas, false, 'sin WhatsApp: no');
});

test('suma pagos y toma el último medio usado', () => {
  const [c] = armarClientes([perfil('ana', 25)], [pago('ana', -40, 'visa'), pago('ana', -5, 'yape')], ahora);
  assert.equal(c.cantidad_pagos, 2);
  assert.equal(c.total_pagado, 19.8);
  assert.equal(c.ultimo_medio, 'yape');
});
