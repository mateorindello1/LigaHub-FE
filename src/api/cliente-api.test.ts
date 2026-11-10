import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Rol } from '../modelos/sesion';
import { clienteApi } from './cliente-api';
import { ErrorApi } from './error-api';
import { sesionGuardada, type Sesion } from './sesion-guardada';

/**
 * Tests del cliente de API con fetch simulado: renovación del token de acceso con el token de
 * refresco (que viaja en la cookie y acá no se ve).
 */

/** Sesión con el token indicado, que vence dentro de los milisegundos indicados. */
function sesionCon(token: string, venceEnMs = 15 * 60_000): Sesion {
  return {
    token,
    expira: new Date(Date.now() + venceEnMs).toISOString(),
    usuario: {
      id: 1,
      email: 'prueba@ligahub.test',
      fotoPerfilURL: null,
      jugadorId: null,
      jugador: null,
      roles: [Rol.Administrador],
    },
  };
}

/** Respuesta JSON con el estado indicado. */
const json = (estado: number, cuerpo: unknown) =>
  new Response(JSON.stringify(cuerpo), { status: estado });

/**
 * fetch simulado: /auth/refrescar responde con `refresco`; los demás pedidos responden 200 solo
 * con el token "nuevo" y 401 con cualquier otro.
 */
function simularApi(refresco: () => Response) {
  const fetchSimulado = vi.fn((url: string, opciones: RequestInit) => {
    if (url.endsWith('/auth/refrescar')) return Promise.resolve(refresco());
    const autorizacion = (opciones.headers as Record<string, string>)
      .Authorization;
    return Promise.resolve(
      autorizacion === 'Bearer nuevo'
        ? json(200, [{ id: 1 }])
        : json(401, { mensaje: 'La sesión venció o no es válida.' }),
    );
  });
  vi.stubGlobal('fetch', fetchSimulado);
  return fetchSimulado;
}

/** Cantidad de pedidos a /auth/refrescar. */
const refrescos = (fetchSimulado: ReturnType<typeof simularApi>) =>
  fetchSimulado.mock.calls.filter(([url]) => url.endsWith('/auth/refrescar'))
    .length;

describe('clienteApi con token de refresco', () => {
  beforeEach(() => {
    // Arrange: sesión iniciada con un token que la API ya no acepta.
    sesionGuardada.guardar(sesionCon('viejo'));
  });

  afterEach(() => {
    sesionGuardada.borrar('cierre', false);
    vi.unstubAllGlobals();
  });

  it('ante un 401 renueva el token y reintenta el pedido', async () => {
    // Arrange
    const fetchSimulado = simularApi(() => json(200, sesionCon('nuevo')));

    // Act
    const datos = await clienteApi.get<{ id: number }[]>('/usuarios');

    // Assert
    expect(datos).toEqual([{ id: 1 }]);
    expect(sesionGuardada.obtener()?.token).toBe('nuevo');
    expect(refrescos(fetchSimulado)).toBe(1);
    // Todos los pedidos van con la cookie (credentials: 'include').
    for (const [, opciones] of fetchSimulado.mock.calls) {
      expect(opciones.credentials).toBe('include');
    }
  });

  it('si no se puede renovar, cierra la sesión como vencida y lanza el 401', async () => {
    // Arrange
    simularApi(() => json(401, { mensaje: 'La sesión venció.' }));

    // Act
    const pedido = clienteApi.get('/usuarios');

    // Assert
    await expect(pedido).rejects.toMatchObject({ estado: 401 });
    await expect(pedido).rejects.toBeInstanceOf(ErrorApi);
    expect(sesionGuardada.obtener()).toBeNull();
    expect(sesionGuardada.ultimoMotivo()).toBe('vencida');
  });

  it('si el token está por vencer, lo renueva antes de enviar el pedido', async () => {
    // Arrange: vence en 10 segundos.
    sesionGuardada.guardar(sesionCon('viejo', 10_000));
    const fetchSimulado = simularApi(() => json(200, sesionCon('nuevo')));

    // Act
    await clienteApi.get('/usuarios');

    // Assert: un refresco y un solo pedido a la API, ya con el token nuevo.
    expect(fetchSimulado.mock.calls.map(([url]) => url)).toEqual([
      expect.stringContaining('/auth/refrescar'),
      expect.stringContaining('/usuarios'),
    ]);
  });

  it('varios pedidos con 401 al mismo tiempo comparten un solo refresco', async () => {
    // Arrange: el token de refresco sirve una sola vez; dos refrescos cortarían la sesión.
    const fetchSimulado = simularApi(() => json(200, sesionCon('nuevo')));

    // Act
    await Promise.all([
      clienteApi.get('/usuarios'),
      clienteApi.get('/jugadores'),
      clienteApi.get('/torneos'),
    ]);

    // Assert
    expect(refrescos(fetchSimulado)).toBe(1);
  });
});
