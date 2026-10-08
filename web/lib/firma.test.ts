import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { firmaMercadoPagoValida } from './firma.ts';

const secreto = 'mi-secreto';
const firmar = (manifiesto: string) => createHmac('sha256', secreto).update(manifiesto).digest('hex');

test('firma correcta', () => {
  const v1 = firmar('id:123456;request-id:abc-1;ts:1704908010;');
  assert.equal(
    firmaMercadoPagoValida({ xSignature: `ts=1704908010,v1=${v1}`, xRequestId: 'abc-1', dataId: '123456', secreto }),
    true,
  );
});

test('data.id alfanumérico se compara en minúsculas', () => {
  const v1 = firmar('id:abc123;request-id:r;ts:1;');
  assert.equal(firmaMercadoPagoValida({ xSignature: `ts=1,v1=${v1}`, xRequestId: 'r', dataId: 'ABC123', secreto }), true);
});

test('id de orden ("ORD...") firmado en mayúsculas o minúsculas: aceptada', () => {
  const id = 'ORD01JYH1Z1YJN4HZ8J3Q0RB3YP6D';
  for (const firmado of [id, id.toLowerCase()]) {
    const v1 = firmar(`id:${firmado};request-id:r;ts:1;`);
    assert.equal(firmaMercadoPagoValida({ xSignature: `ts=1,v1=${v1}`, xRequestId: 'r', dataId: id, secreto }), true);
  }
});

test('firma alterada o secreto distinto: rechazada', () => {
  const v1 = firmar('id:123456;request-id:abc-1;ts:1704908010;');
  assert.equal(firmaMercadoPagoValida({ xSignature: `ts=1704908010,v1=${v1}`, xRequestId: 'abc-1', dataId: '999', secreto }), false);
  assert.equal(firmaMercadoPagoValida({ xSignature: `ts=1704908010,v1=${v1}`, xRequestId: 'abc-1', dataId: '123456', secreto: 'otro' }), false);
});

test('sin cabecera: rechazada', () => {
  assert.equal(firmaMercadoPagoValida({ xSignature: null, xRequestId: null, dataId: '1', secreto }), false);
  assert.equal(firmaMercadoPagoValida({ xSignature: 'basura', xRequestId: null, dataId: '1', secreto }), false);
});
