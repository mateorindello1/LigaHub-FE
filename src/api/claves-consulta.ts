/**
 * Claves de las consultas de TanStack Query. Identifican cada dato en la caché:
 * al guardar algo, se invalida la clave y todas las pantallas que lo muestran se actualizan.
 *
 * Son jerárquicas: invalidar ['torneos'] invalida también ['torneos', 1, 'posiciones'].
 */
export const clavesConsulta = {
  torneos: ['torneos'] as const,
  torneo: (id: number) => ['torneos', id] as const,
  inscripciones: (torneoId: number) =>
    ['torneos', torneoId, 'inscripciones'] as const,
  inscripcion: (torneoId: number, inscripcionId: string) =>
    ['torneos', torneoId, 'inscripciones', inscripcionId] as const,
  plantel: (torneoId: number, inscripcionId: string) =>
    ['torneos', torneoId, 'inscripciones', inscripcionId, 'jugadores'] as const,
  posiciones: (torneoId: number) =>
    ['torneos', torneoId, 'posiciones'] as const,
  detalleEquipo: (torneoId: number, equipoId: number) =>
    ['torneos', torneoId, 'equipos', equipoId] as const,
  fixture: (torneoId: number) => ['torneos', torneoId, 'fixture'] as const,
  goleadores: (torneoId: number) =>
    ['torneos', torneoId, 'goleadores'] as const,
  suspensiones: (torneoId: number) =>
    ['torneos', torneoId, 'suspensiones'] as const,
  /** Todas las planillas: un resultado cambia las suspensiones de otros partidos. */
  partidos: ['partidos'] as const,
  equipos: ['equipos'] as const,
  equipo: (id: number) => ['equipos', id] as const,
  usuarios: ['usuarios'] as const,
  /** La foto cambia de identificador con cada subida: la clave lo incluye. */
  fotoPerfil: (usuarioId: number, fotoPerfil: string) =>
    ['usuarios', usuarioId, 'foto', fotoPerfil] as const,
  predios: ['predios'] as const,
  partido: (id: string) => ['partidos', id] as const,
  predio: (id: number) => ['predios', id] as const,
  jugadores: ['jugadores'] as const,
  jugadoresDisponibles: (torneoId: number) =>
    ['jugadores', 'disponibles', torneoId] as const,
  jugador: (id: number) => ['jugadores', id] as const,
};
