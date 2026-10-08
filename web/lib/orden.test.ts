import { test } from 'node:test';
import assert from 'node:assert/strict';
import { referenciaDeUsuario, resumenOrden, usuarioDeReferencia, validarOrdenPagada, type OrdenMP } from './orden.ts';

const USUARIO = '3f2b8c1e-1d2a-4b7f-9c3e-5a6b7c8d9e0f';
const pagada = (cambios: Partial<OrdenMP> = {}): OrdenMP => ({
  id: 'ORD01JYH1Z1YJN4HZ8J3Q0RB3YP6D',
  status: 'processed',
  status_detail: 'accredited',
  total_amount: '9.90',
  total_paid_amount: '9.90',
  currency: 'PEN',
  external_reference: referenciaDeUsuario(USUARIO),
  transactions: { payments: [{ id: 'PAY01', status: 'processed', status_detail: 'accredited', amount: '9.90', payment_method: { id: 'yape', type: 'debit_card' } }] },
  ...cambios,
});

test('orden pagada por Yape: activa al usuario de la referencia', () => {
  const r = validarOrdenPagada(pagada());
  assert.deepEqual(r, { ok: true, usuarioId: USUARIO, monto: 9.9, moneda: 'PEN', metodo: 'yape' });
});

test('orden todavía en proceso: no activa', () => {
  const r = validarOrdenPagada(pagada({ status: 'processing', status_detail: 'in_process' }));
  assert.equal(r.ok, false);
});

test('monto menor al plan: no activa', () => {
  assert.equal(validarOrdenPagada(pagada({ total_paid_amount: '1.00' })).ok, false);
});

test('otra moneda: no activa', () => {
  assert.equal(validarOrdenPagada(pagada({ currency: 'USD' })).ok, false);
});

test('referencia ajena o manipulada: no activa', () => {
  assert.equal(validarOrdenPagada(pagada({ external_reference: 'otra-tienda:123' })).ok, false);
  assert.equal(validarOrdenPagada(pagada({ external_reference: 'premium_no-es-uuid' })).ok, false);
});

test('orden de otro usuario al verificar desde la página de éxito: no activa', () => {
  assert.equal(validarOrdenPagada(pagada(), '00000000-0000-0000-0000-000000000000').ok, false);
  assert.equal(validarOrdenPagada(pagada(), USUARIO).ok, true);
});

test('resumen de estados', () => {
  assert.equal(resumenOrden(pagada()), 'pagada');
  assert.equal(resumenOrden(pagada({ status: 'action_required', status_detail: 'waiting_payment' })), 'pendiente');
  assert.equal(resumenOrden(pagada({ status: 'failed', status_detail: 'rejected_by_issuer' })), 'rechazada');
});

test('referencia: solo letras, números y "_", y se puede recuperar el usuario', () => {
  const ref = referenciaDeUsuario(USUARIO);
  assert.match(ref, /^[a-z0-9_]+$/);
  assert.ok(ref.length <= 64);
  assert.equal(usuarioDeReferencia(ref), USUARIO);
  assert.equal(usuarioDeReferencia('premium-mensual:' + USUARIO), null);
});
