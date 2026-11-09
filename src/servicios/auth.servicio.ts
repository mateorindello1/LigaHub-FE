import { clienteApi } from '../api/cliente-api';
import type {
  DatosLogin,
  RespuestaLogin,
  UsuarioSesion,
} from '../modelos/sesion';

/** Servicio de autenticación (/auth). */
export const authServicio = {
  iniciarSesion: (datos: DatosLogin) =>
    clienteApi.post<RespuestaLogin>('/auth/login', datos),
  obtenerUsuarioActual: (signal?: AbortSignal) =>
    clienteApi.get<UsuarioSesion>('/auth/yo', signal),
};
