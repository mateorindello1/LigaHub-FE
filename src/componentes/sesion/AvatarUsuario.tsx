import { useEffect, useRef } from 'react';
import { useFotoPerfil } from '../../hooks/fotos-perfil.hooks';
import type { UsuarioSesion } from '../../modelos/sesion';
import { inicialesDe } from '../../utilidades/iniciales';

interface Props {
  usuario: Pick<UsuarioSesion, 'id' | 'email' | 'fotoPerfil' | 'jugador'>;
  /** Lado en píxeles. */
  tamanio?: number;
}

/** Foto de perfil redonda, o las iniciales si no tiene. */
export function AvatarUsuario({ usuario, tamanio = 32 }: Props) {
  const foto = useFotoPerfil(usuario);
  const estilo = { width: tamanio, height: tamanio, fontSize: tamanio * 0.4 };

  return foto ? (
    <ImagenDeArchivo archivo={foto} estilo={estilo} />
  ) : (
    <span className="avatar-usuario avatar-usuario--iniciales" style={estilo}>
      {inicialesDe(usuario)}
    </span>
  );
}

/**
 * Muestra una imagen que está en memoria (un Blob descargado con fetch).
 *
 * URL.createObjectURL le da al Blob una dirección "blob:" que el <img> puede usar. Esa dirección
 * ocupa memoria hasta que se libera con revokeObjectURL, así que se crea en un efecto y se libera
 * al cambiar la imagen o al desmontar. Se asigna directo al elemento (sincronizar con el DOM es
 * justo para lo que sirven los efectos), sin pasar por el estado de React.
 */
function ImagenDeArchivo({
  archivo,
  estilo,
}: {
  archivo: Blob;
  estilo: React.CSSProperties;
}) {
  const imagen = useRef<HTMLImageElement>(null);
  useEffect(() => {
    const direccion = URL.createObjectURL(archivo);
    if (imagen.current) imagen.current.src = direccion;
    return () => URL.revokeObjectURL(direccion);
  }, [archivo]);

  return (
    <img
      ref={imagen}
      className="avatar-usuario"
      alt="Foto de perfil"
      style={estilo}
    />
  );
}
