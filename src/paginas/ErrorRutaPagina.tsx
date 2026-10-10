import { isRouteErrorResponse, Link, useRouteError } from 'react-router';
import { ButtonComponent } from '@syncfusion/ej2-react-buttons';
import { EncabezadoPagina } from '../componentes/comunes/EncabezadoPagina';

/**
 * Pantalla para los errores inesperados al dibujar una pantalla o al cargar su código.
 * Reemplaza la pantalla de error de React Router (en inglés y con detalles técnicos).
 * Es el equivalente del <ErrorBoundary> de Blazor.
 */
export function ErrorRutaPagina() {
  const error = useRouteError();

  // El detalle técnico va a la consola, para quien desarrolla; al usuario, un mensaje claro.
  console.error(error);

  // Al publicar una versión nueva, los archivos de la anterior dejan de existir y una pantalla
  // que todavía no se había cargado falla. Recargar la página lo resuelve.
  const faltaCodigo =
    error instanceof Error &&
    /dynamically imported module|Importing a module script failed/i.test(
      error.message,
    );

  const descripcion = isRouteErrorResponse(error)
    ? `El servidor respondió ${error.status}.`
    : faltaCodigo
      ? 'Hay una versión nueva de la aplicación. Recargá la página para seguir.'
      : 'Ocurrió un error inesperado al mostrar esta pantalla.';

  return (
    <>
      <EncabezadoPagina titulo="Algo salió mal" descripcion={descripcion} />
      <div className="acciones-error">
        <ButtonComponent isPrimary onClick={() => window.location.reload()}>
          Recargar la página
        </ButtonComponent>
        <Link className="e-btn e-flat e-primary" to="/">
          Volver al inicio
        </Link>
      </div>
    </>
  );
}
