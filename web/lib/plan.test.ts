import { test } from 'node:test';
import assert from 'node:assert/strict';
import { estadoPlan } from './plan.ts';

const DIA = 24 * 60 * 60 * 1000;
const ahora = new Date('2026-10-08T12:00:00Z');
const en = (dias: number) => new Date(ahora.getTime() + dias * DIA);

test('sin pago nunca: free, sin acceso', () => {
  const e = estadoPlan(null, ahora);
  assert.equal(e.tipo, 'free');
  assert.equal(e.accesoPremium, false);
});

test('vigente con más de 3 días: activo', () => {
  const e = estadoPlan(en(20), ahora);
  assert.equal(e.tipo, 'activo');
  assert.equal(e.accesoPremium, true);
  assert.equal(e.diasRestantes, 20);
});

test('vence en 3 días o menos: por_vencer (con acceso)', () => {
  const e = estadoPlan(en(2.5), ahora);
  assert.equal(e.tipo, 'por_vencer');
  assert.equal(e.accesoPremium, true);
  assert.equal(e.diasRestantes, 3);
});

test('venció hace 1 día: tolerancia, todavía con acceso, le quedan 2 días', () => {
  const e = estadoPlan(en(-1), ahora);
  assert.equal(e.tipo, 'tolerancia');
  assert.equal(e.accesoPremium, true);
  assert.equal(e.diasRestantes, 2);
});

test('venció hace 3 días exactos: vencido, sin acceso', () => {
  const e = estadoPlan(en(-3), ahora);
  assert.equal(e.tipo, 'vencido');
  assert.equal(e.accesoPremium, false);
});

test('acepta fechas en texto (como vienen de la base de datos)', () => {
  assert.equal(estadoPlan(en(10).toISOString(), ahora).tipo, 'activo');
});
