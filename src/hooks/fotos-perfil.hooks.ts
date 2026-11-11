import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { clavesConsulta } from '../api/claves-consulta';
import { sesionGuardada } from '../api/sesion-guardada';
import type { UsuarioSesion } from '../modelos/sesion';
import { fotosPerfilServicio } from '../servicios/fotos-perfil.servicio';

/**
 * Foto de un usuario (el archivo, en memoria), o undefined si no tiene o todavía no llegó.
 * Se descarga con fetch porque lleva el token; AvatarUsuario la muestra.
 */
export function useFotoPerfil(
  usuario: Pick<UsuarioSesion, 'id' | 'fotoPerfil'> | null,
): Blob | undefined {
  const fotoPerfil = usuario?.fotoPerfil ?? null;
  const { data } = useQuery({
    // La clave incluye el identificador de la foto: una foto nueva es otra consulta.
    queryKey: clavesConsulta.fotoPerfil(usuario?.id ?? 0, fotoPerfil ?? ''),
    queryFn: ({ signal }) => fotosPerfilServicio.obtener(usuario!.id, signal),
    enabled: fotoPerfil !== null,
    // La misma foto no cambia: no hace falta volver a pedirla.
    staleTime: Infinity,
  });
  // Al quitar la foto, la consulta anterior puede seguir en caché: sin foto, no se muestra.
  return fotoPerfil ? data : undefined;
}

/**
 * Después de subir o quitar la foto: actualiza el usuario de la sesión (la barra superior muestra
 * la foto nueva enseguida) y la lista de usuarios del Administrador.
 */
function useAlCambiarFoto() {
  const clienteConsultas = useQueryClient();
  return (usuario: UsuarioSesion) => {
    sesionGuardada.actualizarUsuario(usuario);
    return clienteConsultas.invalidateQueries({
      queryKey: clavesConsulta.usuarios,
    });
  };
}

/** Sube o reemplaza la foto del usuario de la sesión. */
export function useSubirFotoPerfil() {
  const alCambiar = useAlCambiarFoto();
  return useMutation({
    mutationFn: (archivo: File) => fotosPerfilServicio.subir(archivo),
    onSuccess: alCambiar,
  });
}

/** Usa como foto una imagen de internet (la descarga la API). */
export function useSubirFotoDesdeUrl() {
  const alCambiar = useAlCambiarFoto();
  return useMutation({
    mutationFn: (url: string) => fotosPerfilServicio.subirDesdeUrl(url),
    onSuccess: alCambiar,
  });
}

/** Quita la foto del usuario de la sesión. */
export function useQuitarFotoPerfil() {
  const alCambiar = useAlCambiarFoto();
  return useMutation({
    mutationFn: () => fotosPerfilServicio.quitar(),
    onSuccess: alCambiar,
  });
}
