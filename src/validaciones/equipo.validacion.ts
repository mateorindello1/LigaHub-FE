import { z } from 'zod';

/**
 * Indica si el texto es una URL absoluta con http o https y un dominio con extensión
 * (ejemplo.com) o una IP. Replica a @IsUrl del backend, que rechaza "http://localhost/...".
 */
function esUrlWeb(texto: string): boolean {
  if (!URL.canParse(texto)) return false;
  const { protocol, hostname } = new URL(texto);
  const protocoloValido = protocol === 'http:' || protocol === 'https:';
  const tieneDominio = /\.[a-z]{2,}$/i.test(hostname);
  const esIp = /^\d{1,3}(\.\d{1,3}){3}$/.test(hostname);
  return protocoloValido && (tieneDominio || esIp);
}

/**
 * Reglas del formulario de equipo, con los mismos mensajes que el backend (CrearEquipoDto).
 * La unicidad del nombre no se puede validar acá: la responde el backend con un 409,
 * que se muestra en el formulario.
 */
export const esquemaEquipo = z.object({
  nombre: z
    .string()
    .trim()
    .min(1, 'El nombre es obligatorio.')
    .max(100, 'El nombre admite hasta 100 caracteres.'),
  /** Vacío significa "sin escudo"; al enviar se convierte en null. */
  escudoURL: z
    .string()
    .trim()
    .max(500, 'La URL del escudo admite hasta 500 caracteres.')
    .refine(
      (url) => url === '' || esUrlWeb(url),
      'El escudo debe ser una URL válida (http o https).',
    ),
});

export type DatosFormularioEquipo = z.infer<typeof esquemaEquipo>;
