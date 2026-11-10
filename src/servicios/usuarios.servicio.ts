import { clienteApi } from '../api/cliente-api';
import type {
  CambiarContrasenia,
  CrearUsuario,
  ModificarUsuario,
  Usuario,
} from '../modelos/usuario';

/** Servicio de usuarios: un método por endpoint de /usuarios (solo para el Administrador). */
export const usuariosServicio = {
  obtenerTodos: (signal?: AbortSignal) =>
    clienteApi.get<Usuario[]>('/usuarios', signal),
  crear: (datos: CrearUsuario) => clienteApi.post<Usuario>('/usuarios', datos),
  modificar: (id: number, datos: ModificarUsuario) =>
    clienteApi.patch<Usuario>(`/usuarios/${id}`, datos),
  cambiarContrasenia: (id: number, datos: CambiarContrasenia) =>
    clienteApi.patch<void>(`/usuarios/${id}/contrasenia`, datos),
  borrar: (id: number) => clienteApi.delete(`/usuarios/${id}`),
};
