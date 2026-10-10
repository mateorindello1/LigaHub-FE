/** Error de validación de un campo, tal como lo devuelve la API en "detalles". */
export interface DetalleError {
  campo: string;
  mensajes: string[];
}

/**
 * Error devuelto por la API (formato RespuestaError del backend) o error de conexión.
 * Se lanza desde el cliente de API y se muestra al usuario con su mensaje.
 */
export class ErrorApi extends Error {
  /** Código HTTP. 0 si no se pudo conectar con el servidor. */
  readonly estado: number;
  /** Errores por campo (solo en errores de validación). */
  readonly detalles: DetalleError[];

  constructor(estado: number, mensaje: string, detalles: DetalleError[] = []) {
    super(mensaje);
    this.name = 'ErrorApi';
    this.estado = estado;
    this.detalles = detalles;
  }

  /** Arma el error a partir de la respuesta de la API. */
  static desdeRespuesta(estado: number, cuerpo: unknown): ErrorApi {
    const { mensaje, detalles } = (cuerpo ?? {}) as {
      mensaje?: string;
      detalles?: DetalleError[];
    };
    return new ErrorApi(
      estado,
      mensaje ?? `Error inesperado del servidor (${estado}).`,
      detalles ?? [],
    );
  }

  /** Indica si el error es del pedido (4xx) y no tiene sentido reintentarlo. */
  get esErrorDelCliente(): boolean {
    return this.estado >= 400 && this.estado < 500;
  }
}

/** Devuelve un mensaje para mostrar al usuario a partir de cualquier error (o de un texto). */
export function mensajeDeError(error: unknown): string {
  if (error instanceof ErrorApi) return error.message;
  if (typeof error === 'string' && error !== '') return error;
  return 'Ocurrió un error inesperado.';
}
