import { expect, test } from '@playwright/test';

/**
 * Recorrido sin iniciar sesión: el listado con filtro (posiciones por torneo) y el detalle de un
 * equipo, y la protección de las pantallas de administración. No modifica datos.
 */
test.describe('Navegación pública', () => {
  test('posiciones → detalle del equipo con sus partidos y jugadores', async ({
    page,
  }) => {
    // Arrange y Act: inicio → Posiciones (por defecto, el torneo en curso).
    await page.goto('/');
    await page
      .getByRole('navigation', { name: 'Navegación principal' })
      .getByRole('link', { name: 'Posiciones' })
      .click();

    // Assert: la tabla de Apertura con sus 6 equipos.
    await expect(page).toHaveURL(/\/posiciones/);
    const filas = page.locator('.e-grid .e-row');
    await expect(filas).toHaveCount(6);

    // Act: se elige el primer equipo de la tabla.
    const enlace = filas.first().getByRole('link');
    // El último texto del enlace es el nombre (antes están las iniciales del escudo).
    const equipo = (await enlace.locator('span').last().innerText()).trim();
    await enlace.click();

    // Assert: el detalle hace un nuevo pedido y muestra datos de varias clases.
    await expect(
      page.getByRole('heading', { level: 1, name: equipo }),
    ).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Partidos' })).toBeVisible();
    await expect(
      page.getByRole('heading', { name: 'Jugadores' }),
    ).toBeVisible();
    await expect(page.getByText('Volver a la tabla')).toBeVisible();
  });

  test('goleadores y suspensiones del torneo en curso, sin iniciar sesión', async ({
    page,
  }) => {
    const menu = page.getByRole('navigation', { name: 'Navegación principal' });

    // Act: inicio → Goleadores (por defecto, el torneo en curso).
    await page.goto('/');
    await menu.getByRole('link', { name: 'Goleadores' }).click();

    // Assert: Apertura tiene fechas jugadas, así que hay goleadores; el primero va en la posición 1.
    await expect(page).toHaveURL(/\/goleadores/);
    const goleadores = page.locator('.e-grid .e-row');
    await expect(goleadores.first()).toBeVisible();
    await expect(goleadores.first().locator('td').first()).toHaveText('1');

    // Act: Suspensiones.
    await menu.getByRole('link', { name: 'Suspensiones' }).click();

    // Assert: las dos secciones y la explicación de las reglas.
    await expect(page).toHaveURL(/\/suspensiones/);
    await expect(
      page.getByRole('heading', { name: 'Sanciones' }),
    ).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Tarjetas' })).toBeVisible();
    await expect(
      page.getByText('Una expulsión suspende una fecha.', { exact: false }),
    ).toBeVisible();
  });

  test('una pantalla de administración lleva al login', async ({ page }) => {
    // Act
    await page.goto('/torneos');

    // Assert: redirige al login y recuerda a qué pantalla volver.
    await expect(page).toHaveURL(/\/login\?volver=%2Ftorneos/);
    await expect(
      page.getByRole('heading', { name: 'Iniciar sesión' }),
    ).toBeVisible();
  });

  test('una dirección inexistente, un id inválido o un recurso que no existe llevan al inicio', async ({
    page,
  }) => {
    for (const direccion of [
      // Ruta que no existe.
      '/no-existe',
      // Id con formato inválido.
      '/posiciones/abc/equipos/1',
      // Ids con formato válido, pero que no existen: la API responde 404.
      '/posiciones/999999/equipos/999999',
      '/inscripciones/1/00000000-0000-0000-0000-000000000000',
    ]) {
      // Act
      await page.goto(direccion);

      // Assert: queda en el inicio, sin ningún mensaje que confirme que no existe.
      await expect(page).toHaveURL(/\/$/);
      await expect(page.getByText('no existe')).toHaveCount(0);
    }
  });
});
