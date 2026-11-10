import { Link } from 'react-router';
import { EncabezadoPagina } from '../componentes/comunes/EncabezadoPagina';

/** Pantalla para quien inició sesión pero no tiene el rol que pide la pantalla. */
export function SinPermisoPagina() {
  return (
    <>
      <EncabezadoPagina
        titulo="Sin permiso"
        descripcion="Tu usuario no tiene permiso para ver esta pantalla. Si necesitás acceso, pedíselo a un administrador."
      />
      <Link className="e-btn e-primary" to="/">
        Volver al inicio
      </Link>
    </>
  );
}
