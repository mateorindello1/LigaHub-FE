import { expect, test } from '@playwright/test';
import { API, iniciarSesion } from './ayudantes.js';

/**
 * Foto de perfil: el usuario la sube desde la barra superior, se ve en la barra y la quita.
 * Necesita Azurite (lo levanta playwright.config.ts). Deja al usuario sin foto, como estaba.
 */

/** PNG de 1 × 1 píxel: alcanza, porque la API lo vuelve a generar a 256 × 256. */
const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  'base64',
);

let token: string | undefined;

test.afterEach(async ({ request }) => {
  // Limpieza: sin foto, aunque el test falle a mitad de camino.
  if (token) {
    await request.delete(`${API}/usuarios/yo/foto`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  }
});

/**
 * Un solo test con pasos, y no tres tests: así inicia sesión una sola vez. La API acepta 5 logins
 * por minuto desde la misma IP, y la suite completa ya hace varios.
 */
test('el usuario elige, quita y pega su foto de perfil; una dirección interna se rechaza', async ({
  page,
}) => {
  token = await iniciarSesion(page, 'asistente@ligahub.test');
  const avatarBarra = page.getByRole('button', { name: 'Foto de perfil' });
  const dialogo = page.getByRole('dialog', { name: 'Foto de perfil' });
  const avisoExito = page.getByText('Se actualizó tu foto de perfil.');

  await test.step('elige un archivo, la barra muestra la foto y la quita', async () => {
    // Arrange: sin foto, las iniciales.
    await expect(avatarBarra).toHaveText('A');

    // Act: abre el diálogo y elige un archivo.
    await avatarBarra.click();
    await dialogo.getByLabel('Archivo de la foto').setInputFiles({
      name: 'foto.png',
      mimeType: 'image/png',
      buffer: PNG,
    });

    // Assert: la barra muestra la imagen (una dirección "blob:" en memoria).
    await expect(avisoExito.last()).toBeVisible();
    await expect(avatarBarra.locator('img')).toHaveAttribute('src', /^blob:/);

    // Act: la quita.
    await dialogo.getByRole('button', { name: 'Quitar foto' }).click();

    // Assert: vuelven las iniciales.
    await expect(page.getByText('Se quitó tu foto de perfil.')).toBeVisible();
    await expect(avatarBarra.locator('img')).toHaveCount(0);
    await expect(avatarBarra).toHaveText('A');
  });

  await test.step('pega una imagen con Ctrl+V', async () => {
    // Act: un evento de pegado con la imagen en el portapapeles, como al copiar una captura.
    // Se evalúa como texto: el tsconfig de los tests es de Node y no conoce los tipos del DOM.
    await page.evaluate(`{
      const bytes = Uint8Array.from(atob('${PNG.toString('base64')}'), (c) => c.charCodeAt(0));
      const portapapeles = new DataTransfer();
      portapapeles.items.add(new File([bytes], 'captura.png', { type: 'image/png' }));
      document.dispatchEvent(new ClipboardEvent('paste', { clipboardData: portapapeles }));
    }`);

    // Assert
    await expect(avatarBarra.locator('img')).toHaveAttribute('src', /^blob:/);
  });

  await test.step('una dirección de la red interna se rechaza y la foto queda como estaba', async () => {
    // Act: la API no se conecta a la propia máquina (protección contra SSRF).
    await dialogo
      .getByLabel('Dirección de una imagen')
      .fill('http://127.0.0.1/foto.png');
    await dialogo.getByRole('button', { name: 'Usar' }).click();

    // Assert
    await expect(
      page.getByText('Esa dirección no está permitida.'),
    ).toBeVisible();
    await expect(avatarBarra.locator('img')).toHaveCount(1);
  });
});
