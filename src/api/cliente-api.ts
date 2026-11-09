import { entorno } from '../config/entorno';
import { ErrorApi } from './error-api';
import { sesionGuardada } from './sesion-guardada';

type Metodo = 'GET' | 'POST' | 'PATCH' | 'DELETE';

/**
 * Hace un pedido a la API y devuelve el cuerpo de la respuesta ya convertido desde JSON.
 * Si la API responde con error, lanza un ErrorApi con el mensaje y los detalles del backend.
 * Equivale a un servicio base con HttpClient en Blazor.
 *
 * Si hay sesión, envía el token en "Authorization: Bearer <token>" (como un DelegatingHandler
 * que agrega el encabezado a cada pedido de HttpClient).
 */
async function pedir<T>(
  metodo: Metodo,
  ruta: string,
  cuerpo?: unknown,
  signal?: AbortSignal,
): Promise<T> {
  const token = sesionGuardada.obtener()?.token;
  const encabezados: Record<string, string> = {};
  if (cuerpo !== undefined) encabezados['Content-Type'] = 'application/json';
  if (token) encabezados.Authorization = `Bearer ${token}`;

  let respuesta: Response;
  try {
    respuesta = await fetch(`${entorno.apiUrl}${ruta}`, {
      method: metodo,
      headers: encabezados,
      body: cuerpo !== undefined ? JSON.stringify(cuerpo) : undefined,
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
    // 401 con un token enviado: la sesión venció o ya no es válida. Se cierra la sesión, y la
    // aplicación lo avisa (ver ProveedorSesion). Un 401 sin token (por ejemplo, credenciales
    // incorrectas en el login) no cierra nada.
    if (respuesta.status === 401 && token) {
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
  delete: (ruta: string) => pedir<void>('DELETE', ruta),
};
