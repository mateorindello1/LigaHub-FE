import { expect, test } from '@playwright/test';
import { iniciarSesion } from './ayudantes.js';

/**
 * Sesión con token de refresco en una cookie httpOnly: sobrevive a recargar la página, el
 * JavaScript no puede leer ningún token y "Salir" la revoca en la API.
 */
test('la sesión sobrevive a una recarga, no deja tokens al alcance del JavaScript y "Salir" la revoca', async ({
  page,
  context,
}) => {
  // Arrange
  const email = 'asistente@ligahub.test';
  await iniciarSesion(page, email);

  // Act: recarga completa. El token de acceso estaba solo en memoria y se pierde.
  await page.reload();

  // Assert: la sesión se recuperó con la cookie.
  await expect(page.locator('.menu-sesion__email')).toHaveText(email);

  // Assert: la cookie existe, es httpOnly y no aparece en document.cookie ni en el almacenamiento.
  const cookie = (await context.cookies()).find(
    (c) => c.name === 'ligahub_refresco',
  );
  expect(cookie).toMatchObject({ httpOnly: true, secure: true, path: '/auth' });
  // Se evalúa como texto: el tsconfig de los tests es de Node y no conoce los tipos del DOM.
  const alcanceJavaScript = await page.evaluate<string>(
    'document.cookie + JSON.stringify(sessionStorage) + JSON.stringify(localStorage)',
  );
  expect(alcanceJavaScript).not.toContain('ligahub_refresco');
  expect(alcanceJavaScript).not.toContain('token');

  // Act: cerrar la sesión y recargar.
  const cierre = page.waitForResponse((respuesta) =>
    respuesta.url().endsWith('/auth/cerrar-sesion'),
  );
  await page.getByRole('button', { name: 'Cerrar sesión' }).click();
  expect((await cierre).status()).toBe(204);
  await page.reload();

  // Assert: sin sesión y sin cookie.
  await expect(page.getByRole('link', { name: 'Ingresar' })).toBeVisible();
  expect(
    (await context.cookies()).some((c) => c.name === 'ligahub_refresco'),
  ).toBe(false);
});
