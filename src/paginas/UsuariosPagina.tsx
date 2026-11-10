import { useCallback, useState } from 'react';
import { ButtonComponent } from '@syncfusion/ej2-react-buttons';
import {
  ColumnDirective,
  ColumnsDirective,
  GridComponent,
  Inject,
  Page,
  Sort,
} from '@syncfusion/ej2-react-grids';
import { Cargando } from '../componentes/comunes/Cargando';
import { Dialogo } from '../componentes/comunes/Dialogo';
import { DialogoConfirmacion } from '../componentes/comunes/DialogoConfirmacion';
import { EncabezadoPagina } from '../componentes/comunes/EncabezadoPagina';
import { MensajeError } from '../componentes/comunes/MensajeError';
import { useNotificaciones } from '../componentes/notificaciones/contexto-notificaciones';
import { useSesion } from '../componentes/sesion/contexto-sesion';
import { BadgesRoles } from '../componentes/usuarios/BadgesRoles';
import { FormularioContrasenia } from '../componentes/usuarios/FormularioContrasenia';
import { FormularioUsuario } from '../componentes/usuarios/FormularioUsuario';
import { IDIOMA } from '../config/textos-syncfusion';
import {
  useBorrarUsuario,
  useCambiarContrasenia,
  useCrearUsuario,
  useJugadores,
  useModificarUsuario,
  useUsuarios,
} from '../hooks/usuarios.hooks';
import { Rol, type Rol as TipoRol } from '../modelos/sesion';
import { nombreJugador, type Usuario } from '../modelos/usuario';
import type {
  DatosFormularioContrasenia,
  DatosFormularioUsuario,
} from '../validaciones/usuario.validacion';

/** Formulario abierto: sin usuario es un alta; con usuario, una modificación. */
interface Edicion {
  usuario?: Usuario;
}

/** Las columnas de roles y jugador asociado se muestran desde MD (768 px). */
const DESDE_MD = '(min-width: 768px)';

/**
 * Gestión de usuarios (solo el Administrador): grilla con alta, modificación, cambio de contraseña
 * y baja en ventanas modales. En la fila del propio usuario no se ofrece borrar: el backend
 * tampoco lo permite.
 */
export function UsuariosPagina() {
  // #region Estado
  const { data: usuarios, isPending, error, refetch } = useUsuarios();
  const { data: jugadores = [] } = useJugadores();
  const crear = useCrearUsuario();
  const modificar = useModificarUsuario();
  const cambiarContrasenia = useCambiarContrasenia();
  const borrar = useBorrarUsuario();
  const notificaciones = useNotificaciones();
  const idSesion = useSesion().usuario?.id;

  const [edicion, setEdicion] = useState<Edicion | null>(null);
  const [aCambiarContrasenia, setACambiarContrasenia] =
    useState<Usuario | null>(null);
  const [aBorrar, setABorrar] = useState<Usuario | null>(null);
  // #endregion

  // #region Acciones
  async function guardar(datos: DatosFormularioUsuario) {
    // Los roles del formulario son números; la API espera los valores de Rol.
    const roles = datos.roles as TipoRol[];
    // Sin el rol Jugador no puede haber jugador asociado: se envía null para quitarlo.
    const jugadorId = roles.includes(Rol.Jugador)
      ? (datos.jugadorId ?? null)
      : null;

    if (edicion?.usuario) {
      await modificar.mutateAsync({
        id: edicion.usuario.id,
        datos: { email: datos.email, roles, jugadorId },
      });
      notificaciones.exito(`Se modificó el usuario "${datos.email}".`);
    } else {
      await crear.mutateAsync({
        email: datos.email,
        contrasenia: datos.contrasenia,
        roles,
        jugadorId,
      });
      notificaciones.exito(`Se creó el usuario "${datos.email}".`);
    }
    setEdicion(null);
  }

  async function guardarContrasenia(datos: DatosFormularioContrasenia) {
    if (!aCambiarContrasenia) return;
    await cambiarContrasenia.mutateAsync({
      id: aCambiarContrasenia.id,
      datos: { contrasenia: datos.contrasenia },
    });
    notificaciones.exito(
      `Se cambió la contraseña de "${aCambiarContrasenia.email}".`,
    );
    setACambiarContrasenia(null);
  }

  function confirmarBorrado() {
    if (!aBorrar) return;
    borrar.mutate(aBorrar.id, {
      onSuccess: () =>
        notificaciones.exito(`Se borró el usuario "${aBorrar.email}".`),
      onError: (errorBorrado) => notificaciones.error(errorBorrado),
      onSettled: () => setABorrar(null),
    });
  }
  // #endregion

  // #region Plantillas de columnas
  const plantillaEmail = useCallback(
    (usuario: Usuario) => (
      <div className="celda-usuario">
        <span>
          {usuario.email}
          {usuario.id === idSesion && (
            <span className="celda-usuario__vos"> (vos)</span>
          )}
        </span>
        {/* En SM no hay columnas de roles ni de jugador: se muestran debajo del email. */}
        <div className="solo-sm">
          <BadgesRoles roles={usuario.roles} />
        </div>
        {usuario.jugador && (
          <span className="celda-usuario__jugador solo-sm">
            {nombreJugador(usuario.jugador)}
          </span>
        )}
      </div>
    ),
    [idSesion],
  );
  const plantillaRoles = useCallback(
    (usuario: Usuario) => <BadgesRoles roles={usuario.roles} />,
    [],
  );
  const plantillaJugador = useCallback(
    (usuario: Usuario) =>
      usuario.jugador ? nombreJugador(usuario.jugador) : '—',
    [],
  );
  const plantillaAcciones = useCallback(
    (usuario: Usuario) => (
      <div className="acciones-fila">
        <ButtonComponent
          cssClass="e-flat e-round"
          iconCss="e-icons e-edit"
          title={`Modificar ${usuario.email}`}
          aria-label={`Modificar ${usuario.email}`}
          onClick={() => setEdicion({ usuario })}
        />
        <ButtonComponent
          cssClass="e-flat e-round"
          iconCss="e-icons e-lock"
          title={`Cambiar la contraseña de ${usuario.email}`}
          aria-label={`Cambiar la contraseña de ${usuario.email}`}
          onClick={() => setACambiarContrasenia(usuario)}
        />
        {usuario.id !== idSesion && (
          <ButtonComponent
            cssClass="e-flat e-round e-danger"
            iconCss="e-icons e-trash"
            title={`Borrar ${usuario.email}`}
            aria-label={`Borrar ${usuario.email}`}
            onClick={() => setABorrar(usuario)}
          />
        )}
      </div>
    ),
    [idSesion],
  );
  // #endregion

  return (
    <>
      <EncabezadoPagina
        titulo="Usuarios"
        descripcion="Alta, modificación y baja de usuarios, sus roles y contraseñas."
        acciones={
          <ButtonComponent
            isPrimary
            iconCss="e-icons e-plus"
            onClick={() => setEdicion({})}
          >
            Nuevo usuario
          </ButtonComponent>
        }
      />

      {isPending && <Cargando texto="Cargando usuarios…" />}
      {error && <MensajeError error={error} onReintentar={() => refetch()} />}

      {usuarios && (
        <GridComponent
          dataSource={usuarios}
          locale={IDIOMA}
          allowSorting
          allowPaging
          pageSettings={{ pageSize: 10 }}
          enableHover={false}
        >
          <ColumnsDirective>
            <ColumnDirective
              field="email"
              headerText="Email"
              template={plantillaEmail}
            />
            <ColumnDirective
              headerText="Roles"
              width={150}
              template={plantillaRoles}
              hideAtMedia={DESDE_MD}
            />
            <ColumnDirective
              headerText="Jugador asociado"
              template={plantillaJugador}
              hideAtMedia={DESDE_MD}
            />
            <ColumnDirective
              headerText="Acciones"
              width={140}
              textAlign="Right"
              template={plantillaAcciones}
            />
          </ColumnsDirective>
          <Inject services={[Sort, Page]} />
        </GridComponent>
      )}

      {edicion && (
        <Dialogo
          titulo={edicion.usuario ? 'Modificar usuario' : 'Nuevo usuario'}
          onCerrar={() => setEdicion(null)}
        >
          <FormularioUsuario
            usuario={edicion.usuario}
            jugadores={jugadores}
            onGuardar={guardar}
            onCancelar={() => setEdicion(null)}
          />
        </Dialogo>
      )}

      {aCambiarContrasenia && (
        <Dialogo
          titulo={`Cambiar contraseña de ${aCambiarContrasenia.email}`}
          onCerrar={() => setACambiarContrasenia(null)}
        >
          <FormularioContrasenia
            onGuardar={guardarContrasenia}
            onCancelar={() => setACambiarContrasenia(null)}
          />
        </Dialogo>
      )}

      {aBorrar && (
        <DialogoConfirmacion
          titulo="Borrar usuario"
          mensaje={`¿Borrar el usuario "${aBorrar.email}"? Ya no va a poder iniciar sesión. No se puede deshacer.`}
          procesando={borrar.isPending}
          onConfirmar={confirmarBorrado}
          onCancelar={() => setABorrar(null)}
        />
      )}
    </>
  );
}
