import { clienteApi } from '../api/cliente-api';
import type { UsuarioSesion } from '../modelos/sesion';

/** Servicio de fotos de perfil (/usuarios/yo/foto y /usuarios/:id/foto). */
export const fotosPerfilServicio = {
  /** Sube o reemplaza la foto del usuario de la sesión. Devuelve el usuario actualizado. */
  subir: (archivo: File) => {
    // Formulario multipart con el archivo en el campo "foto", como un <form enctype="multipart/form-data">.
    const formulario = new FormData();
    formulario.append('foto', archivo);
    return clienteApi.putArchivo<UsuarioSesion>(
      '/usuarios/yo/foto',
      formulario,
    );
  },
  /** Usa como foto una imagen de internet: la descarga la API. Devuelve el usuario actualizado. */
  subirDesdeUrl: (url: string) =>
    clienteApi.put<UsuarioSesion>('/usuarios/yo/foto/url', { url }),
  /** Quita la foto del usuario de la sesión. Devuelve el usuario actualizado. */
  quitar: () =>
    clienteApi.deleteConRespuesta<UsuarioSesion>('/usuarios/yo/foto'),
  /**
   * Descarga la foto de un usuario. Se pide con el token (la foto no es pública), por eso no
   * alcanza con un <img src="..."> que apunte a la API.
   */
  obtener: (usuarioId: number, signal?: AbortSignal) =>
    clienteApi.obtenerArchivo(`/usuarios/${usuarioId}/foto`, signal),
};
