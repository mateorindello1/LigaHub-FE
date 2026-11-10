import { entorno } from '../config/entorno';
import { ErrorApi } from './error-api';
import type { Sesion } from './sesion-guardada';

/** Refresco en curso: si varias partes lo piden a la vez, comparten el mismo pedido. */
let enCurso: Promise<Sesion | null> | null = null;

/**
 * Pide un token de acceso nuevo con la cookie httpOnly del token de refresco
 * (POST /auth/refrescar). El navegador envía la cookie solo; el JavaScript nunca la ve.
 *
 * Devuelve la sesión nueva, o null si no hay sesión (sin cookie, vencida o revocada).
 * Lanza un ErrorApi si no se pudo conectar o el servidor falló.
 *
 * Cada token de refresco sirve una sola vez: usarlo dos veces se toma como un robo y corta la
 * sesión. Por eso los pedidos simultáneos se unifican:
 * - **En la misma pestaña**, con una sola promesa compartida (por ejemplo, varios pedidos que
 *   reciben 401 al mismo tiempo, o el doble montaje de StrictMode en desarrollo).
 * - **Entre pestañas**, con un bloqueo del navegador (Web Locks): una pestaña espera a que la
 *   otra termine, y para entonces la cookie ya es la nueva.
 */
export function refrescarSesion(): Promise<Sesion | null> {
  enCurso ??= conBloqueo(pedirRefresco).finally(() => {
    enCurso = null;
  });
  return enCurso;
}

/** Ejecuta la función con un bloqueo compartido entre pestañas, si el navegador lo soporta. */
function conBloqueo<T>(funcion: () => Promise<T>): Promise<T> {
  if (typeof navigator !== 'undefined' && navigator.locks) {
    return navigator.locks.request('ligahub.refresco', funcion);
  }
  return funcion();
}

async function pedirRefresco(): Promise<Sesion | null> {
  let respuesta: Response;
  try {
    respuesta = await fetch(`${entorno.apiUrl}/auth/refrescar`, {
      method: 'POST',
      // Sin esto, el navegador no envía la cookie a otro origen ni guarda la nueva.
      credentials: 'include',
    });
  } catch {
    throw new ErrorApi(0, 'No se pudo conectar con el servidor.');
  }

  if (respuesta.status === 401) return null;
  const datos: unknown = await respuesta.json().catch(() => undefined);
  if (!respuesta.ok) throw ErrorApi.desdeRespuesta(respuesta.status, datos);
  return datos as Sesion;
}
