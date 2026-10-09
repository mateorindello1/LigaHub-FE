/**
 * Estados del dominio. Los valores coinciden con los del backend (columnas tinyint).
 *
 * El frontend no admite `enum` de TypeScript (erasableSyntaxOnly), así que se usa el patrón
 * "objeto as const + tipo derivado": EstadoTorneo.Inscripcion se usa como valor (igual que un enum)
 * y EstadoTorneo como tipo admite solo 1, 2 o 3.
 */

export const EstadoTorneo = {
  Inscripcion: 1,
  EnCurso: 2,
  Finalizado: 3,
} as const;
export type EstadoTorneo = (typeof EstadoTorneo)[keyof typeof EstadoTorneo];

export const NOMBRES_ESTADO_TORNEO: Record<EstadoTorneo, string> = {
  [EstadoTorneo.Inscripcion]: 'Inscripción abierta',
  [EstadoTorneo.EnCurso]: 'En curso',
  [EstadoTorneo.Finalizado]: 'Finalizado',
};

export const EstadoPartido = {
  Programado: 1,
  Finalizado: 2,
  WO: 3,
  Suspendido: 4,
} as const;
export type EstadoPartido = (typeof EstadoPartido)[keyof typeof EstadoPartido];

export const NOMBRES_ESTADO_PARTIDO: Record<EstadoPartido, string> = {
  [EstadoPartido.Programado]: 'Programado',
  [EstadoPartido.Finalizado]: 'Finalizado',
  [EstadoPartido.WO]: 'W.O.',
  [EstadoPartido.Suspendido]: 'Suspendido',
};
