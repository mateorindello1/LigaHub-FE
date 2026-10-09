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
  posiciones: (torneoId: number) =>
    ['torneos', torneoId, 'posiciones'] as const,
  detalleEquipo: (torneoId: number, equipoId: number) =>
    ['torneos', torneoId, 'equipos', equipoId] as const,
  fixture: (torneoId: number) => ['torneos', torneoId, 'fixture'] as const,
  equipos: ['equipos'] as const,
  equipo: (id: number) => ['equipos', id] as const,
};
