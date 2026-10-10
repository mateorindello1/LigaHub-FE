import type { ReactNode } from 'react';
import { DialogComponent } from '@syncfusion/ej2-react-popups';
import { IDIOMA } from '../../config/textos-syncfusion';

interface Props {
  titulo: string;
  /** Se llama al cerrar con la cruz o con Escape. */
  onCerrar: () => void;
  /** Mientras es true, el diálogo no se puede cerrar (por ejemplo, durante un guardado). */
  bloqueado?: boolean;
  /** Ancho en pantallas grandes. En celular ocupa el ancho disponible. */
  ancho?: string;
  children: ReactNode;
}

/**
 * Ventana modal sobre el DialogComponent de Syncfusion, con la configuración común de la aplicación.
 * Se monta cuando hay que mostrarla y se desmonta al cerrarla: así cada apertura arranca limpia.
 */
export function Dialogo({
  titulo,
  onCerrar,
  bloqueado = false,
  ancho = '480px',
  children,
}: Props) {
  return (
    <DialogComponent
      visible
      isModal
      header={titulo}
      width={ancho}
      cssClass="dialogo"
      locale={IDIOMA}
      // Por defecto Syncfusion mueve el diálogo al <body>, fuera del contenedor de React.
      // React escucha los eventos (onSubmit, onClick) solo dentro de su raíz, así que ahí
      // los botones y el envío del formulario dejarían de funcionar. Por eso se dibuja en #root.
      target="#root"
      showCloseIcon={!bloqueado}
      closeOnEscape={!bloqueado}
      // Syncfusion avisa el cierre; el componente padre decide desmontarlo.
      close={onCerrar}
      animationSettings={{ effect: 'Fade', duration: 150 }}
    >
      {children}
    </DialogComponent>
  );
}
