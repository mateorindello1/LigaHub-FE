import { useMemo } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Rol } from '../../modelos/sesion';
import type { JugadorResumen, Usuario } from '../../modelos/usuario';
import {
  crearEsquemaUsuario,
  LARGO_MINIMO_CONTRASENIA,
  type DatosFormularioUsuario,
} from '../../validaciones/usuario.validacion';
import { MensajeError } from '../comunes/MensajeError';
import { BotonesFormulario } from '../formularios/BotonesFormulario';
import { CampoLista } from '../formularios/CampoLista';
import { CampoTexto } from '../formularios/CampoTexto';
import { mostrarErrorDelServidor } from '../formularios/errores-servidor';
import { CampoRoles } from './CampoRoles';

/** Opción de la lista de jugadores. */
interface OpcionJugador {
  id: number;
  texto: string;
}

interface Props {
  /** Usuario a modificar. Si no se pasa, el formulario es de alta. */
  usuario?: Usuario;
  /** Todos los jugadores; la lista muestra los que no tienen usuario y el del propio usuario. */
  jugadores: JugadorResumen[];
  /** Guarda los datos. Si la promesa falla, el error se muestra en el formulario. */
  onGuardar: (datos: DatosFormularioUsuario) => Promise<void>;
  onCancelar: () => void;
}

/**
 * Formulario de alta y modificación de usuario. La contraseña se pide solo en el alta; después se
 * cambia con su propio formulario. La lista de jugadores aparece solo con el rol Jugador marcado.
 */
export function FormularioUsuario({
  usuario,
  jugadores,
  onGuardar,
  onCancelar,
}: Props) {
  const esAlta = !usuario;
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<DatosFormularioUsuario>({
    resolver: zodResolver(crearEsquemaUsuario(esAlta)),
    defaultValues: {
      email: usuario?.email ?? '',
      contrasenia: '',
      roles: usuario?.roles ?? [],
      jugadorId: usuario?.jugadorId ?? null,
    },
  });

  // Con cada cambio de roles se vuelve a dibujar: así aparece o desaparece la lista de jugadores.
  const roles = useWatch({ control, name: 'roles' });
  const conRolJugador = roles.includes(Rol.Jugador);

  // Jugadores elegibles: los que no tienen usuario y el que ya tiene este usuario.
  // Memoizado: Syncfusion recarga la lista si recibe un arreglo nuevo en cada dibujo.
  const opcionesJugador = useMemo<OpcionJugador[]>(
    () =>
      jugadores
        .filter((j) => j.usuarioId === null || j.usuarioId === usuario?.id)
        .map((j) => ({
          id: j.id,
          texto: `${j.apellidos}, ${j.nombres} (DNI ${j.dni})`,
        })),
    [jugadores, usuario?.id],
  );

  const enviar = handleSubmit(async (datos) => {
    try {
      await onGuardar(datos);
    } catch (error) {
      mostrarErrorDelServidor(error, setError, [
        'email',
        'contrasenia',
        'roles',
        'jugadorId',
      ]);
    }
  });

  return (
    <form onSubmit={enviar} noValidate>
      <CampoTexto
        control={control}
        nombre="email"
        etiqueta="Email"
        tipo="email"
        autocompletar="off"
      />
      {esAlta && (
        <CampoTexto
          control={control}
          nombre="contrasenia"
          etiqueta="Contraseña"
          tipo="password"
          autocompletar="new-password"
          ayuda={`Al menos ${LARGO_MINIMO_CONTRASENIA} caracteres.`}
        />
      )}
      <CampoRoles control={control} nombre="roles" />
      {conRolJugador && (
        <CampoLista
          control={control}
          nombre="jugadorId"
          etiqueta="Jugador asociado"
          opciones={opcionesJugador}
          campoTexto="texto"
          campoValor="id"
          ayuda="Solo se listan los jugadores que no tienen usuario."
        />
      )}
      {errors.root?.servidor && (
        <MensajeError error={errors.root.servidor.message} />
      )}
      <BotonesFormulario guardando={isSubmitting} onCancelar={onCancelar} />
    </form>
  );
}
