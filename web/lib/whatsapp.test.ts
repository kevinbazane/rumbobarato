import { test } from 'node:test';
import assert from 'node:assert/strict';
import { linkChatWhatsapp, normalizarWhatsapp } from './whatsapp.ts';

test('celular peruano en distintos formatos', () => {
  for (const n of ['987654321', '987 654 321', '+51 987 654 321', '51987654321', '+51-987-654-321']) {
    assert.equal(normalizarWhatsapp(n), '+51987654321', n);
  }
});

test('rechaza números peruanos que no son celulares o están incompletos', () => {
  for (const n of ['', '12345', '87654321', '014567890', '+51 187654321', 'hola']) {
    assert.equal(normalizarWhatsapp(n), null, n);
  }
});

test('acepta números de otros países con su código', () => {
  assert.equal(normalizarWhatsapp('+56 9 1234 5678'), '+56912345678');
});

test('link de chat sin el signo +', () => {
  assert.equal(linkChatWhatsapp('+51987654321'), 'https://wa.me/51987654321');
});
