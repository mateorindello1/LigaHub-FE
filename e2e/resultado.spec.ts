import { expect, test } from '@playwright/test';
import { borrarPorApi, iniciarSesion } from './ayudantes.js';

/** Datos para dejar el partido como estaba, aunque el test se corte a mitad de camino. */
let token = '';
let partidoId = '';

/**
 * Limpieza: deja el partido programado (si ya lo está, la API responde 409). Va en afterEach y no
 * en un finally: si el test se pasa del tiempo, Playwright lo corta, pero afterEach corre igual.
 */
test.afterEach(async ({ request }) => {
  if (token && partidoId) {
    await borrarPorApi(request, token, `/partidos/${partidoId}/resultado`);
  }
});

/**
 * Caso de uso 2 de punta a punta: el Asistente carga el resultado del primer partido de la fecha 4
 * de Apertura (programado en el seed), lo ve en el fixture y lo anula. Al terminar, el partido
 * vuelve a estar programado, como en el seed.
 */
test('el Asistente carga un resultado con un gol y lo anula', async ({
  page,
}) => {
  token = await iniciarSesion(page, 'asistente@ligahub.test');

  // Arrange: el fixture de Apertura y el primer partido de la fecha 4.
  await page.goto('/fixture?torneo=1');
  const primerPartidoFecha4 = () =>
    page.locator('.tarjeta-fecha').nth(3).locator('.partido').first();
  await primerPartidoFecha4()
    .getByRole('link', { name: /Resultado de/ })
    .click();
  await expect(
    page.getByRole('heading', { name: 'Resultado del partido' }),
  ).toBeVisible();
  partidoId = page.url().split('/').pop()!;

  // Act: jugaron todos y hay un gol del primer jugador del local.
  for (const boton of await page.getByRole('button', { name: 'Todos' }).all()) {
    await boton.click();
  }
  await page.getByRole('button', { name: 'Agregar evento' }).click();
  const dialogo = page.getByRole('dialog');
  await dialogo.getByLabel('Minuto').fill('23');
  // Jugador: con el foco en la lista, la flecha abajo elige la primera opción ("dorsal · Apellido,
  // Nombre", del local), como lo haría alguien con el teclado.
  const jugador = dialogo.locator('#inscripcionJugadorId');
  await jugador.focus();
  await jugador.press('ArrowDown');
  await expect(jugador).toHaveValue(/·/);
  await dialogo.getByRole('button', { name: 'Agregar' }).click();

  // Assert: el marcador se calcula mientras se carga.
  await expect(page.locator('.marcador-partido__goles')).toHaveText('1 - 0');
  await expect(page.locator('.lista-eventos__item')).toHaveCount(1);

  // Act: guardar, confirmando el resultado calculado.
  await page.getByRole('button', { name: 'Guardar resultado' }).click();
  const confirmacion = page.getByRole('dialog');
  await expect(confirmacion).toContainText('1 - 0');
  await confirmacion.getByRole('button', { name: 'Guardar' }).click();

  // Assert: vuelve al fixture con el resultado.
  await expect(page).toHaveURL(/\/fixture\?torneo=1/);
  await expect(primerPartidoFecha4()).toContainText('1 - 0');

  // Act: anular desde la planilla.
  await primerPartidoFecha4()
    .getByRole('link', { name: /Resultado de/ })
    .click();
  await page.getByRole('button', { name: 'Anular resultado' }).click();
  await page
    .getByRole('dialog')
    .getByRole('button', { name: 'Anular' })
    .click();

  // Assert: sin resultado, ya no se ofrece anular.
  await expect(page.getByText(/Se anuló el resultado/)).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Anular resultado' }),
  ).toHaveCount(0);
});
