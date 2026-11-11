/** Tamaño máximo de la foto: 2 MB, igual que en el backend. */
export const TAMANIO_MAXIMO_FOTO = 2 * 1024 * 1024;

/** Tipos aceptados. Es para avisar antes de subir: la validación real la hace el backend. */
export const TIPOS_FOTO = ['image/jpeg', 'image/png', 'image/webp'];

/** Indica si un texto es una dirección http o https (por ejemplo, lo que se pegó). */
export function esDireccionWeb(texto: string): boolean {
  try {
    const url = new URL(texto.trim());
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Valida el archivo elegido antes de subirlo. Devuelve el mensaje de error, o null si es válido.
 * Evita subir 10 MB para recibir un 413; el backend igual revisa el contenido real del archivo.
 */
export function validarFotoPerfil(archivo: File): string | null {
  if (!TIPOS_FOTO.includes(archivo.type)) {
    return 'La foto tiene que ser una imagen JPG, PNG o WebP.';
  }
  if (archivo.size > TAMANIO_MAXIMO_FOTO) {
    return 'La foto no puede superar los 2 MB.';
  }
  return null;
}
