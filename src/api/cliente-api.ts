import { entorno } from '../config/entorno';
import { ErrorApi } from './error-api';
import { refrescarSesion } from './refresco-sesion';
import { sesionGuardada, type Sesion } from './sesion-guardada';

type Metodo = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';

/** Margen antes del vencimiento del token de acceso en el que ya se pide uno nuevo. */
const MARGEN_RENOVACION_MS = 30_000;

/**
 * Renueva el token de acceso con el token de refresco. Si ya no hay sesión, la cierra (y la
 * aplicación avisa "tu sesión venció"). Si no se pudo conectar, la deja como estaba.
 * @returns la sesión nueva, o null si no se pudo renovar.
 */
async function renovarSesion(): Promise<Sesion | null> {
  try {
    const sesion = await refrescarSesion();
    if (sesion) sesionGuardada.guardar(sesion);
    else sesionGuardada.borrar('vencida');
    return sesion;
  } catch {
    return null;
  }
}

/**
 * Hace un pedido a la API y devuelve el cuerpo de la respuesta ya convertido desde JSON.
 * Si la API responde con error, lanza un ErrorApi con el mensaje y los detalles del backend.
 * Equivale a un servicio base con HttpClient en Blazor.
 *
 * Si hay sesión, envía el token de acceso en "Authorization: Bearer <token>" (como un
 * DelegatingHandler que agrega el encabezado a cada pedido de HttpClient). El token dura poco:
 * - Si está por vencer, se renueva antes de enviar el pedido.
 * - Si la API responde 401 igual (por ejemplo, venció mientras la pestaña estaba suspendida), se
 *   renueva y se reintenta el pedido una vez.
 */
async function pedir<T>(
  metodo: Metodo,
  ruta: string,
  cuerpo?: unknown,
  signal?: AbortSignal,
  reintentar = true,
): Promise<T> {
  let sesion = sesionGuardada.obtener();
  if (
    sesion &&
    new Date(sesion.expira).getTime() - Date.now() < MARGEN_RENOVACION_MS
  ) {
    sesion = (await renovarSesion()) ?? sesionGuardada.obtener();
  }
  const token = sesion?.token;

  const encabezados: Record<string, string> = {};
  if (cuerpo !== undefined) encabezados['Content-Type'] = 'application/json';
  if (token) encabezados.Authorization = `Bearer ${token}`;

  let respuesta: Response;
  try {
    respuesta = await fetch(`${entorno.apiUrl}${ruta}`, {
      method: metodo,
      headers: encabezados,
      body: cuerpo !== undefined ? JSON.stringify(cuerpo) : undefined,
      // Envía y recibe la cookie del token de refresco (la API está en otro origen).
      credentials: 'include',
      signal,
    });
  } catch (error) {
    // Pedido cancelado (por ejemplo, al salir de la pantalla): se propaga tal cual.
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw error;
    }
    throw new ErrorApi(
      0,
      'No se pudo conectar con el servidor. Verificá tu conexión o que la API esté levantada.',
    );
  }

  // 204 No Content (por ejemplo, después de borrar): no hay cuerpo.
  if (respuesta.status === 204) {
    return undefined as T;
  }

  const texto = await respuesta.text();
  const datos: unknown = texto ? JSON.parse(texto) : undefined;

  if (!respuesta.ok) {
    // 401 con un token enviado: el token de acceso ya no sirve. Se renueva y se reintenta una
    // vez; si no se puede renovar, la sesión queda cerrada. Un 401 sin token (por ejemplo,
    // credenciales incorrectas en el login) no cierra nada.
    if (respuesta.status === 401 && token) {
      if (reintentar && (await renovarSesion())) {
        return pedir<T>(metodo, ruta, cuerpo, signal, false);
      }
      sesionGuardada.borrar('vencida');
    }
    throw ErrorApi.desdeRespuesta(respuesta.status, datos);
  }
  return datos as T;
}

/** Cliente de la API: un método por verbo HTTP. Lo usan los servicios de cada recurso. */
export const clienteApi = {
  get: <T>(ruta: string, signal?: AbortSignal) =>
    pedir<T>('GET', ruta, undefined, signal),
  post: <T>(ruta: string, cuerpo?: unknown) => pedir<T>('POST', ruta, cuerpo),
  patch: <T>(ruta: string, cuerpo: unknown) => pedir<T>('PATCH', ruta, cuerpo),
  put: <T>(ruta: string, cuerpo: unknown) => pedir<T>('PUT', ruta, cuerpo),
  delete: (ruta: string) => pedir<void>('DELETE', ruta),
};
