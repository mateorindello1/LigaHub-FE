import { Link } from 'react-router';
import { EncabezadoPagina } from '../componentes/comunes/EncabezadoPagina';

/** Pantalla para las rutas que no existen. */
export function NoEncontradaPagina() {
  return (
    <>
      <EncabezadoPagina
        titulo="Página no encontrada"
        descripcion="La dirección que ingresaste no existe."
      />
      <Link className="e-btn e-primary" to="/">
        Volver al inicio
      </Link>
    </>
  );
}
