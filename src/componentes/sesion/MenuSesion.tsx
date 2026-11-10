import { Link, useLocation, useNavigate } from 'react-router';
import { ButtonComponent } from '@syncfusion/ej2-react-buttons';
import { NOMBRES_ROL } from '../../modelos/sesion';
import { useNotificaciones } from '../notificaciones/contexto-notificaciones';
import { useSesion } from './contexto-sesion';

/**
 * Sesión en la barra superior: el usuario con su rol y "Salir", o el acceso a "Ingresar".
 * En celular se muestran solo los íconos, para que entren en la barra.
 */
export function MenuSesion() {
  const { usuario, verificando, cerrarSesion } = useSesion();
  const notificaciones = useNotificaciones();
  const ubicacion = useLocation();
  const navegar = useNavigate();

  // Mientras se recupera la sesión no se muestra nada, para que "Ingresar" no aparezca un instante.
  if (verificando) return null;

  if (!usuario) {
    // En la pantalla de login no hace falta el acceso.
    if (ubicacion.pathname === '/login') return null;
    // Después de iniciar sesión se vuelve a la pantalla actual.
    const volver = encodeURIComponent(ubicacion.pathname + ubicacion.search);
    return (
      <Link
        to={`/login?volver=${volver}`}
        className="e-btn e-inherit menu-sesion__ingresar"
      >
        <span className="e-icons e-user" aria-hidden="true" />
        <span>Ingresar</span>
      </Link>
    );
  }

  const roles = usuario.roles.map((rol) => NOMBRES_ROL[rol]).join(', ');
  return (
    <div className="menu-sesion">
      <span className="menu-sesion__usuario">
        <span className="menu-sesion__email">{usuario.email}</span>
        <span className="menu-sesion__rol">{roles}</span>
      </span>
      <ButtonComponent
        cssClass="e-inherit menu-sesion__salir"
        iconCss="e-icons e-export"
        aria-label="Cerrar sesión"
        title="Cerrar sesión"
        onClick={() => {
          cerrarSesion();
          notificaciones.exito('Cerraste la sesión.');
          // Al inicio: si estaba en una pantalla de administración, sin sesión lo llevaría al login.
          navegar('/');
        }}
      >
        <span className="menu-sesion__texto">Salir</span>
      </ButtonComponent>
    </div>
  );
}
