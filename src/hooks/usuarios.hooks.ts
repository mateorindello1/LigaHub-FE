import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { clavesConsulta } from '../api/claves-consulta';
import type {
  CambiarContrasenia,
  CrearUsuario,
  ModificarUsuario,
} from '../modelos/usuario';
import { usuariosServicio } from '../servicios/usuarios.servicio';

/*
 * Hooks de datos de usuarios: mismo patrón que torneos.hooks.ts (ViewModel de listado y comandos).
 * Las operaciones invalidan también ['jugadores']: la lista de jugadores muestra qué jugador ya
 * tiene usuario, y eso cambia al asociar, quitar o borrar.
 */

/** Lista de usuarios. */
export function useUsuarios() {
  return useQuery({
    queryKey: clavesConsulta.usuarios,
    queryFn: ({ signal }) => usuariosServicio.obtenerTodos(signal),
  });
}

/** Invalida usuarios y jugadores después de una operación exitosa. */
function useInvalidarUsuarios() {
  const clienteConsultas = useQueryClient();
  return () =>
    Promise.all([
      clienteConsultas.invalidateQueries({ queryKey: clavesConsulta.usuarios }),
      clienteConsultas.invalidateQueries({
        queryKey: clavesConsulta.jugadores,
      }),
    ]);
}

/** Alta de un usuario. */
export function useCrearUsuario() {
  const invalidar = useInvalidarUsuarios();
  return useMutation({
    mutationFn: (datos: CrearUsuario) => usuariosServicio.crear(datos),
    onSuccess: invalidar,
  });
}

/** Modificación de un usuario (email, roles y jugador asociado). */
export function useModificarUsuario() {
  const invalidar = useInvalidarUsuarios();
  return useMutation({
    mutationFn: ({ id, datos }: { id: number; datos: ModificarUsuario }) =>
      usuariosServicio.modificar(id, datos),
    onSuccess: invalidar,
  });
}

/** Cambio de contraseña de un usuario. No cambia nada que se muestre: no invalida. */
export function useCambiarContrasenia() {
  return useMutation({
    mutationFn: ({ id, datos }: { id: number; datos: CambiarContrasenia }) =>
      usuariosServicio.cambiarContrasenia(id, datos),
  });
}

/** Baja de un usuario. */
export function useBorrarUsuario() {
  const invalidar = useInvalidarUsuarios();
  return useMutation({
    mutationFn: (id: number) => usuariosServicio.borrar(id),
    onSuccess: invalidar,
  });
}
