/*
 * Formatos para mostrar datos. Usan Intl, el equivalente de CultureInfo y ToString("...") de .NET.
 */

const formatoFechaHora = new Intl.DateTimeFormat('es-AR', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

/**
 * Fecha y hora de la API (UTC, ISO 8601) en la hora local del navegador: "sáb, 19 sept, 17:00".
 * Devuelve "A confirmar" si no hay fecha.
 */
export function formatearFechaHora(iso: string | null): string {
  if (!iso) return 'A confirmar';
  return formatoFechaHora.format(new Date(iso));
}

/** Diferencia de gol con signo: +3, 0, -2. */
export function formatearDiferencia(valor: number): string {
  return valor > 0 ? `+${valor}` : String(valor);
}

/**
 * Texto preparado para buscar: en minúsculas y sin tildes, así "gomez" encuentra "Gómez".
 * normalize('NFD') separa cada letra de su tilde, y la expresión quita las tildes sueltas.
 */
export function normalizarParaBuscar(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();
}
