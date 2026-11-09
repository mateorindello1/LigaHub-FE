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
      {/*
        Contenedor fijo del Toast. Syncfusion mueve el elemento del Toast al <body>, fuera de
        #root. Sin este div, ese elemento movido sería el "hermano siguiente" de toda la aplicación
        para React, y al insertar una pantalla nueva antes de él (por ejemplo, la primera pantalla
        que termina de cargar mientras se muestra un aviso) fallaría con "insertBefore: the node
        ... is not a child of this node". El div no se mueve, así que React siempre lo encuentra.
      */}
      <div className="contenedor-avisos">
        <ToastComponent
          ref={toast}
          position={{ X: 'Center', Y: 'Bottom' }}
          timeOut={4000}
          showCloseButton
          newestOnTop
        />
      </div>
    </ContextoNotificaciones.Provider>
  );
}
