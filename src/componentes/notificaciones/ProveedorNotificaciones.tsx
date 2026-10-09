import { useMemo, useRef, type ReactNode } from 'react';
import { ToastComponent } from '@syncfusion/ej2-react-notifications';
import { mensajeDeError } from '../../api/error-api';
import {
  ContextoNotificaciones,
  type Notificaciones,
} from './contexto-notificaciones';

interface Props {
  children: ReactNode;
}

/**
 * Muestra avisos emergentes (toasts) con el componente de Syncfusion y los ofrece al resto
 * de la aplicación a través del contexto. Se monta una sola vez, alrededor de toda la app.
 */
export function ProveedorNotificaciones({ children }: Props) {
  const toast = useRef<ToastComponent | null>(null);

  // useMemo: el objeto se crea una sola vez y no provoca que se vuelvan a dibujar los consumidores.
  const notificaciones = useMemo<Notificaciones>(
    () => ({
      exito: (mensaje) =>
        toast.current?.show({
          title: 'Listo',
          content: mensaje,
          cssClass: 'e-toast-success',
        }),
      error: (errorOMensaje) =>
        toast.current?.show({
          title: 'No se pudo completar la operación',
          content:
            typeof errorOMensaje === 'string'
              ? errorOMensaje
              : mensajeDeError(errorOMensaje),
          cssClass: 'e-toast-danger',
          timeOut: 7000,
        }),
    }),
    [],
  );

  return (
    <ContextoNotificaciones.Provider value={notificaciones}>
      {children}
      <ToastComponent
        ref={toast}
        position={{ X: 'Center', Y: 'Bottom' }}
        timeOut={4000}
        showCloseButton
        newestOnTop
      />
    </ContextoNotificaciones.Provider>
  );
}
