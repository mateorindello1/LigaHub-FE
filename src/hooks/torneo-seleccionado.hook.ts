import { useSearchParams } from 'react-router';
import type { Torneo } from '../modelos/torneo';

/**
 * Torneo elegido en las pantallas que filtran por torneo (inscripciones, posiciones, fixture).
 *
 * Se guarda en la URL (?torneo=2) y no en un useState: así el enlace se puede compartir o
 * guardar, el botón Atrás del navegador funciona y las tarjetas del inicio pueden abrir una
 * pantalla con el torneo ya elegido.
 *
 * Si la URL no trae un torneo válido, se usa el primero que cumpla "preferido" (o el primero).
 *
 * @param torneos Lista de torneos (undefined mientras carga).
 * @param preferido Criterio para elegir el torneo por defecto.
 */
export function useTorneoSeleccionado(
  torneos: Torneo[] | undefined,
  preferido: (torneo: Torneo) => boolean = () => true,
) {
  const [parametros, setParametros] = useSearchParams();

  // El torneo se deduce en cada dibujo a partir de la URL y la lista: no hay estado que sincronizar.
  const idEnUrl = Number(parametros.get('torneo'));
  const torneo =
    torneos?.find((t) => t.id === idEnUrl) ??
    torneos?.find(preferido) ??
    torneos?.[0] ??
    null;

  /** Elige otro torneo. replace: no agrega una entrada al historial por cada cambio de filtro. */
  function seleccionar(torneoId: number) {
    setParametros({ torneo: String(torneoId) }, { replace: true });
  }

  return { torneo, seleccionar };
}
