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

  test('una pantalla de administración lleva al login', async ({ page }) => {
    // Act
    await page.goto('/torneos');

    // Assert: redirige al login y recuerda a qué pantalla volver.
    await expect(page).toHaveURL(/\/login\?volver=%2Ftorneos/);
    await expect(
      page.getByRole('heading', { name: 'Iniciar sesión' }),
    ).toBeVisible();
  });
});
