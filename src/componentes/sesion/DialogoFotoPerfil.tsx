import { useEffect, useEffectEvent, useRef, useState } from 'react';
import { ButtonComponent } from '@syncfusion/ej2-react-buttons';
import { TextBoxComponent } from '@syncfusion/ej2-react-inputs';
import {
  useQuitarFotoPerfil,
  useSubirFotoDesdeUrl,
  useSubirFotoPerfil,
} from '../../hooks/fotos-perfil.hooks';
import type { UsuarioSesion } from '../../modelos/sesion';
import {
  esDireccionWeb,
  TIPOS_FOTO,
  validarFotoPerfil,
} from '../../validaciones/foto-perfil.validacion';
import { Dialogo } from '../comunes/Dialogo';
import { useNotificaciones } from '../notificaciones/contexto-notificaciones';
import { AvatarUsuario } from './AvatarUsuario';

interface Props {
  usuario: UsuarioSesion;
  onCerrar: () => void;
}

const MENSAJE_EXITO = 'Se actualizó tu foto de perfil.';

/**
 * Diálogo para subir, reemplazar o quitar la foto de perfil. Hay tres formas de elegirla, y en
 * todas se sube enseguida, sin un botón "Guardar" aparte:
 * - **Archivo:** un <input type="file"> oculto que se abre con un botón (el input nativo no se
 *   puede estilar, y así el botón queda igual que los demás de Syncfusion).
 * - **Pegar (Ctrl+V):** una imagen copiada (por ejemplo, una captura de pantalla o "Copiar imagen"
 *   en el navegador), o la dirección de una imagen.
 * - **Dirección de una imagen de internet:** la descarga la API, que no se conecta a direcciones
 *   internas (ver DescargadorImagenes en el backend).
 */
export function DialogoFotoPerfil({ usuario, onCerrar }: Props) {
  const notificaciones = useNotificaciones();
  const selector = useRef<HTMLInputElement>(null);
  const [direccion, setDireccion] = useState('');
  const subir = useSubirFotoPerfil();
  const subirDesdeUrl = useSubirFotoDesdeUrl();
  const quitar = useQuitarFotoPerfil();
  const ocupado =
    subir.isPending || subirDesdeUrl.isPending || quitar.isPending;

  /** Valida un archivo (elegido o pegado) y lo sube. */
  function subirArchivo(archivo: File) {
    const error = validarFotoPerfil(archivo);
    if (error) {
      notificaciones.error(error);
      return;
    }
    subir.mutate(archivo, {
      onSuccess: () => notificaciones.exito(MENSAJE_EXITO),
      onError: (errorSubida) => notificaciones.error(errorSubida),
    });
  }

  /** Pide a la API que descargue la imagen de esa dirección. */
  function usarDireccion(url: string) {
    if (!esDireccionWeb(url)) {
      notificaciones.error(
        'Escribí la dirección completa de la imagen, con http:// o https://.',
      );
      return;
    }
    subirDesdeUrl.mutate(url.trim(), {
      onSuccess: () => {
        setDireccion('');
        notificaciones.exito(MENSAJE_EXITO);
      },
      onError: (errorDescarga) => notificaciones.error(errorDescarga),
    });
  }

  /**
   * Pegado en cualquier parte mientras el diálogo está abierto. useEffectEvent: el efecto se
   * suscribe una sola vez, pero la función ve siempre los valores actuales (como un handler de
   * evento común); sin esto, habría que volver a suscribirse en cada dibujo.
   */
  const alPegar = useEffectEvent((evento: ClipboardEvent) => {
    if (ocupado) return;
    const imagen = [...(evento.clipboardData?.files ?? [])].find((archivo) =>
      archivo.type.startsWith('image/'),
    );
    if (imagen) {
      evento.preventDefault();
      subirArchivo(imagen);
      return;
    }
    // Una dirección pegada en el campo de texto se deja escribir normalmente; en cualquier otro
    // lugar del diálogo, se usa directamente.
    const texto = evento.clipboardData?.getData('text') ?? '';
    const enUnCampo = evento.target instanceof HTMLInputElement;
    if (!enUnCampo && esDireccionWeb(texto)) {
      evento.preventDefault();
      usarDireccion(texto);
    }
  });

  useEffect(() => {
    document.addEventListener('paste', alPegar);
    return () => document.removeEventListener('paste', alPegar);
  }, []);

  return (
    <Dialogo titulo="Foto de perfil" onCerrar={onCerrar} bloqueado={ocupado}>
      <div className="dialogo-foto">
        <AvatarUsuario usuario={usuario} tamanio={128} />
        <p className="texto-secundario">
          JPG, PNG o WebP, hasta 2 MB. Se recorta cuadrada. También podés pegar
          una imagen con Ctrl+V o usar la dirección de una imagen de internet.
        </p>
        <input
          ref={selector}
          type="file"
          accept={TIPOS_FOTO.join(',')}
          hidden
          aria-label="Archivo de la foto"
          onChange={(evento) => {
            const archivo = evento.target.files?.[0];
            // Se limpia el input: así elegir el mismo archivo otra vez vuelve a disparar el cambio.
            evento.target.value = '';
            if (archivo) subirArchivo(archivo);
          }}
        />
        <div className="dialogo-foto__acciones">
          <ButtonComponent
            isPrimary
            iconCss="e-icons e-upload-1"
            disabled={ocupado}
            onClick={() => selector.current?.click()}
          >
            {subir.isPending
              ? 'Subiendo…'
              : usuario.fotoPerfil
                ? 'Cambiar foto'
                : 'Elegir foto'}
          </ButtonComponent>
          {usuario.fotoPerfil && (
            <ButtonComponent
              iconCss="e-icons e-trash"
              disabled={ocupado}
              onClick={() =>
                quitar.mutate(undefined, {
                  onSuccess: () =>
                    notificaciones.exito('Se quitó tu foto de perfil.'),
                  onError: (errorQuitar) => notificaciones.error(errorQuitar),
                })
              }
            >
              Quitar foto
            </ButtonComponent>
          )}
        </div>
        <form
          className="dialogo-foto__direccion"
          onSubmit={(evento) => {
            evento.preventDefault();
            usarDireccion(direccion);
          }}
        >
          <TextBoxComponent
            value={direccion}
            // Con etiqueta flotante, el placeholder también es el nombre accesible del campo.
            placeholder="Dirección de una imagen (https://…)"
            floatLabelType="Auto"
            type="url"
            enabled={!ocupado}
            input={(evento) => setDireccion(evento.value)}
          />
          <ButtonComponent
            type="submit"
            disabled={ocupado || direccion.trim() === ''}
          >
            {subirDesdeUrl.isPending ? 'Descargando…' : 'Usar'}
          </ButtonComponent>
        </form>
      </div>
    </Dialogo>
  );
}
