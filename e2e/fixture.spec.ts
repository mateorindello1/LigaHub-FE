import { expect, test } from '@playwright/test';
import { borrarPorApi, iniciarSesion } from './ayudantes.js';

/** Torneo del seed con las inscripciones abiertas (4 equipos, sin fixture). */
const CLAUSURA = 2;

/** Token de la sesión, para limpiar por la API. */
let token = '';

/**
 * Limpieza: deja Clausura sin fixture (si ya no tiene, la API responde 404). Va en afterEach y no
 * en un finally: si el test se pasa del tiempo, Playwright lo corta, pero afterEach corre igual.
 */
test.afterEach(async ({ request }) => {
  if (token) {
    await borrarPorApi(request, token, `/torneos/${CLAUSURA}/fixture`);
  }
});

/**
 * Caso de uso 1 de punta a punta: el Administrador genera el fixture de Clausura (ida y vuelta),
 * ve las fechas y la tabla de posiciones del torneo, y lo deshace. Al terminar, Clausura vuelve a
 * estar en inscripción, como en el seed.
 */
test('el Administrador genera el fixture, ve las posiciones y lo deshace', async ({
  page,
}) => {
  token = await iniciarSesion(page, 'administrador@ligahub.test');

  // Arrange: Clausura todavía no tiene fixture.
  await page.goto(`/fixture?torneo=${CLAUSURA}`);
  await expect(
    page.getByText('Este torneo todavía no tiene fixture.'),
  ).toBeVisible();

  // Act: generar con ida y vuelta.
  await page.getByRole('button', { name: 'Generar fixture' }).click();
  const dialogo = page.getByRole('dialog');
  await dialogo.getByText('Ida y vuelta').click();
  await dialogo.getByRole('button', { name: 'Generar' }).click();

  // Assert: 4 equipos con ida y vuelta son 6 fechas de 2 partidos.
  await expect(page.locator('.tarjeta-fecha')).toHaveCount(6);
  await expect(page.locator('.tarjeta-fecha .partido')).toHaveCount(12);
  await expect(
    page.getByText(/Se generó el fixture de Clausura/),
  ).toBeVisible();

  // Assert: las inscripciones quedaron cerradas y la tabla tiene los 4 equipos.
  await page.goto(`/inscripciones?torneo=${CLAUSURA}`);
  await expect(
    page.getByText(/inscripciones de equipos de este torneo están cerradas/),
  ).toBeVisible();
  await page.goto(`/posiciones?torneo=${CLAUSURA}`);
  await expect(page.locator('.e-grid .e-row')).toHaveCount(4);

  // Act: deshacer el fixture.
  await page.goto(`/fixture?torneo=${CLAUSURA}`);
  await page.getByRole('button', { name: 'Deshacer fixture' }).click();
  await page
    .getByRole('dialog')
    .getByRole('button', { name: 'Deshacer' })
    .click();

  // Assert: el torneo vuelve a inscripción, sin fechas.
  await expect(
    page.getByText('Este torneo todavía no tiene fixture.'),
  ).toBeVisible();
  await expect(page.locator('.tarjeta-fecha')).toHaveCount(0);
});
