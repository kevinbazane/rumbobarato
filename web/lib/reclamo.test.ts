import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fechaLimiteRespuesta, numeroHoja, validarReclamo } from './reclamo.ts';

const valido = {
  nombre: 'Ana Torres Ramos', tipo_documento: 'DNI', numero_documento: '45678912',
  domicilio: 'Av. Arequipa 123, Lima', telefono: '987654321', email: 'Ana@Correo.pe',
  menor_de_edad: false, bien_tipo: 'servicio', monto: '9.90', descripcion_bien: 'Plan Premium mensual',
  tipo: 'reclamo', detalle: 'Pagué el plan y no se activó el acceso Premium.', pedido: 'Que activen mi plan o me devuelvan el dinero.',
};

test('hoja completa: válida y normaliza datos', () => {
  const r = validarReclamo(valido);
  assert.equal(r.ok, true);
  if (r.ok) {
    assert.equal(r.datos.email, 'ana@correo.pe');
    assert.equal(r.datos.monto, 9.9);
    assert.equal(r.datos.apoderado, null);
  }
});

test('faltan datos obligatorios: indica cuáles', () => {
  const r = validarReclamo({ ...valido, nombre: '', detalle: 'corto', tipo: 'otro' });
  assert.equal(r.ok, false);
  if (!r.ok) assert.deepEqual(Object.keys(r.errores).sort(), ['detalle', 'nombre', 'tipo']);
});

test('DNI de 8 dígitos y correo válido', () => {
  const r = validarReclamo({ ...valido, numero_documento: '1234', email: 'no-es-correo' });
  assert.equal(r.ok, false);
  if (!r.ok) assert.ok(r.errores.numero_documento && r.errores.email);
});

test('menor de edad: exige apoderado', () => {
  const r = validarReclamo({ ...valido, menor_de_edad: true, apoderado: '' });
  assert.equal(r.ok, false);
  assert.equal(validarReclamo({ ...valido, menor_de_edad: true, apoderado: 'Rosa Ramos' }).ok, true);
});

test('número de hoja con ceros y año de Lima', () => {
  assert.equal(numeroHoja(7, '2026-10-09T15:00:00Z'), '000007-2026');
  // 1 de enero a las 03:00 UTC todavía es 31 de diciembre en Lima.
  assert.equal(numeroHoja(1, '2027-01-01T03:00:00Z'), '000001-2026');
});

test('fecha límite: 15 días hábiles sin contar sábados ni domingos', () => {
  // Viernes 9 oct 2026 → 15 días hábiles después = viernes 30 oct 2026.
  assert.equal(fechaLimiteRespuesta('2026-10-09T15:00:00Z'), '2026-10-30');
  // Registrado un sábado: se empieza a contar desde el lunes.
  assert.equal(fechaLimiteRespuesta('2026-10-10T15:00:00Z'), '2026-10-30');
});
