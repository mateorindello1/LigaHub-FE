import { Cargando } from '../componentes/comunes/Cargando';
import { EncabezadoPagina } from '../componentes/comunes/EncabezadoPagina';
import { MensajeError } from '../componentes/comunes/MensajeError';
import { TarjetaTorneo } from '../componentes/torneos/TarjetaTorneo';
import { useTorneos } from '../hooks/torneos.hooks';

/** Pantalla de inicio: los torneos con accesos a sus inscripciones, su tabla de posiciones y su fixture. */
export function InicioPagina() {
  // useTorneos usa useQuery: pide los datos con el servicio, los guarda en caché y expone el
  // estado del pedido. Equivale al OnInitializedAsync + IsBusy + manejo de error de un ViewModel.
  const { data: torneos, isPending, error, refetch } = useTorneos();

  return (
    <>
      <EncabezadoPagina
        titulo="Torneos"
        descripcion="Elegí un torneo para ver sus inscripciones, su tabla de posiciones o su fixture."
      />

      {isPending && <Cargando texto="Cargando torneos…" />}
      {error && <MensajeError error={error} onReintentar={() => refetch()} />}

      {torneos && torneos.length === 0 && (
        <p>Todavía no hay torneos cargados.</p>
      )}
      {torneos && torneos.length > 0 && (
        <div className="grilla-tarjetas">
          {torneos.map((torneo) => (
            <TarjetaTorneo key={torneo.id} torneo={torneo} />
          ))}
        </div>
      )}
    </>
  );
}
