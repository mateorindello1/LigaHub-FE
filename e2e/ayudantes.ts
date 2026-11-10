import { expect, type APIRequestContext, type Page } from '@playwright/test';

/** Dirección de la API, para limpiar datos sin pasar por la interfaz. */
export const API = 'http://localhost:3000';

/** Contraseña de los usuarios del seed (ver playwright.config.ts). */
function contrasenia(): string {
  const valor = process.env.E2E_CONTRASENIA;
  if (!valor) {
    throw new Error(
      'Falta la contraseña de los usuarios de prueba: definí E2E_CONTRASENIA o SEED_CONTRASENIA en el .env del backend.',
    );
  }
  return valor;
}

/**
 * Inicia sesión desde la pantalla de login, como lo haría una persona, y espera a que la barra
 * muestre el usuario. Devuelve el token de la sesión, para limpiar datos por la API al terminar.
 */
export async function iniciarSesion(
  page: Page,
  email: string,
): Promise<string> {
  await page.goto('/login');
  await page.getByLabel('Email').fill(email);
  await page.getByLabel('Contraseña').fill(contrasenia());
  await page.getByRole('button', { name: 'Ingresar' }).click();
  // El email de la barra superior (también aparece en el aviso de bienvenida).
  await expect(page.locator('.menu-sesion__email')).toHaveText(email);

  const token = await page.evaluate(
    () =>
      (
        JSON.parse(sessionStorage.getItem('ligahub.sesion') ?? '{}') as {
          token?: string;
        }
      ).token,
  );
  expect(token).toBeTruthy();
  return token!;
}

/** Pedido DELETE a la API con el token, para dejar los datos como estaban. Ignora un 404 o 409. */
export async function borrarPorApi(
  request: APIRequestContext,
  token: string,
  ruta: string,
): Promise<void> {
  await request.delete(`${API}${ruta}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}
