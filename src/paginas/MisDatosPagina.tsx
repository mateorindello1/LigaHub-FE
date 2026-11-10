import { useState } from 'react';
import { Link } from 'react-router';
import { ButtonComponent } from '@syncfusion/ej2-react-buttons';
import { Cargando } from '../componentes/comunes/Cargando';
import { Dialogo } from '../componentes/comunes/Dialogo';
import { EncabezadoPagina } from '../componentes/comunes/EncabezadoPagina';
import { MensajeError } from '../componentes/comunes/MensajeError';
import { EscudoEquipo } from '../componentes/equipos/EscudoEquipo';
import { FormularioJugador } from '../componentes/jugadores/FormularioJugador';
import { useNotificaciones } from '../componentes/notificaciones/contexto-notificaciones';
import { useSesion } from '../componentes/sesion/contexto-sesion';
import { BadgeEstadoTorneo } from '../componentes/torneos/BadgeEstadoTorneo';
import { useJugador, useModificarJugador } from '../hooks/jugadores.hooks';
import { nombreJugador } from '../modelos/jugador';
import type { DatosFormularioJugador } from '../validaciones/jugador.validacion';

/**
 * Datos del jugador asociado al usuario de la sesión (solo el rol Jugador): sus datos personales,
 * con la modificación de los de contacto, y sus inscripciones en equipos.
 *
 * Es el permiso por pertenencia del lado del frontend: la pantalla pide siempre el jugador de la
 * sesión. Si alguien pidiera otro id a mano, el backend responde 403.
 */
export function MisDatosPagina() {
  // #region Estado
  const jugadorId = useSesion().usuario?.jugadorId ?? null;
  const { data: jugador, isPending, error, refetch } = useJugador(jugadorId);
  const modificar = useModificarJugador();
  const notificaciones = useNotificaciones();
  const [editando, setEditando] = useState(false);
  // #endregion

  // #region Acciones
  async function guardar(datos: DatosFormularioJugador) {
    if (jugadorId === null) return;
    // Solo los datos de contacto: el backend rechaza (403) el DNI o el nombre enviados por un jugador.
    await modificar.mutateAsync({
      id: jugadorId,
      datos: {
        email: datos.email,
        telefono: datos.telefono,
        direccion: datos.direccion,
      },
    });
    notificaciones.exito('Se guardaron tus datos.');
    setEditando(false);
  }
  // #endregion

  if (jugadorId === null) {
    return (
      <>
        <EncabezadoPagina titulo="Mis datos" />
        <p>Tu usuario no tiene un jugador asociado.</p>
      </>
    );
  }

  return (
    <>
      <EncabezadoPagina
        titulo="Mis datos"
        descripcion="Tus datos de jugador y los equipos en los que estás inscripto."
        acciones={
          jugador && (
            <ButtonComponent
              isPrimary
              iconCss="e-icons e-edit"
              onClick={() => setEditando(true)}
            >
              Modificar mis datos
            </ButtonComponent>
          )
        }
      />

      {isPending && <Cargando texto="Cargando tus datos…" />}
      {error && <MensajeError error={error} onReintentar={() => refetch()} />}

      {jugador && (
        <div className="mis-datos">
          <section className="tarjeta-datos">
            <h2>{nombreJugador(jugador)}</h2>
            <dl className="lista-datos">
              <div>
                <dt>DNI</dt>
                <dd>{jugador.dni}</dd>
              </div>
              <div>
                <dt>Email de contacto</dt>
                <dd>{jugador.email}</dd>
              </div>
              <div>
                <dt>Teléfono</dt>
                <dd>{jugador.telefono}</dd>
              </div>
              <div>
                <dt>Dirección</dt>
                <dd>{jugador.direccion}</dd>
              </div>
            </dl>
            <p className="referencias">
              El DNI y el nombre solo los puede cambiar un administrador.
            </p>
          </section>

          <section>
            <h2>Mis inscripciones</h2>
            {jugador.inscripciones.length === 0 ? (
              <p className="texto-secundario">
                Todavía no estás inscripto en ningún equipo.
              </p>
            ) : (
              <ul className="lista-inscripciones">
                {jugador.inscripciones.map((inscripcion) => (
                  <li key={inscripcion.id}>
                    <Link
                      className="enlace-equipo celda-equipo"
                      to={`/posiciones/${inscripcion.torneo.id}/equipos/${inscripcion.equipo.id}`}
                    >
                      <EscudoEquipo
                        nombre={inscripcion.equipo.nombre}
                        escudoURL={inscripcion.equipo.escudoURL}
                      />
                      <span>{inscripcion.equipo.nombre}</span>
                    </Link>
                    <span className="lista-inscripciones__torneo">
                      {inscripcion.torneo.nombre} {inscripcion.torneo.anio}{' '}
                      <BadgeEstadoTorneo
                        estado={inscripcion.torneo.estadoTorneo}
                      />
                    </span>
                    <span className="lista-inscripciones__dorsal">
                      Dorsal {inscripcion.dorsal}
                      {inscripcion.capitan && (
                        <span className="e-badge e-badge-primary">Capitán</span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}

      {editando && jugador && (
        <Dialogo
          titulo="Modificar mis datos"
          onCerrar={() => setEditando(false)}
        >
          <FormularioJugador
            jugador={jugador}
            soloContacto
            onGuardar={guardar}
            onCancelar={() => setEditando(false)}
          />
        </Dialogo>
      )}
    </>
  );
}
