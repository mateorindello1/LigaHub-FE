import { entorno } from '../config/entorno';
import { ErrorApi } from './error-api';

type Metodo = 'GET' | 'POST' | 'PATCH' | 'DELETE';

/**
 * Hace un pedido a la API y devuelve el cuerpo de la respuesta ya convertido desde JSON.
 * Si la API responde con error, lanza un ErrorApi con el mensaje y los detalles del backend.
 * Equivale a un servicio base con HttpClient en Blazor.
 */
async function pedir<T>(
  metodo: Metodo,
  ruta: string,
  cuerpo?: unknown,
  signal?: AbortSignal,
): Promise<T> {
  let respuesta: Response;
  try {
    respuesta = await fetch(`${entorno.apiUrl}${ruta}`, {
      method: metodo,
      headers:
        cuerpo !== undefined ? { 'Content-Type': 'application/json' } : {},
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
