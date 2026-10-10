import { useState } from 'react';
import { Link, Outlet, useNavigation } from 'react-router';
import { AppBarComponent } from '@syncfusion/ej2-react-navigations';
import { ButtonComponent } from '@syncfusion/ej2-react-buttons';
import { MenuNavegacion, type ItemMenu } from './MenuNavegacion';
import './Layout.css';

const OPCIONES_MENU: ItemMenu[] = [
  { ruta: '/', texto: 'Inicio', icono: 'e-home' },
  { ruta: '/torneos', texto: 'Torneos', icono: 'e-grid-view' },
  { ruta: '/equipos', texto: 'Equipos', icono: 'e-people' },
  { ruta: '/inscripciones', texto: 'Inscripciones', icono: 'e-checklist' },
  { ruta: '/posiciones', texto: 'Posiciones', icono: 'e-chart' },
  { ruta: '/fixture', texto: 'Fixture', icono: 'e-month' },
];

/**
 * Estructura común de todas las pantallas: barra superior, menú y contenido.
 * Equivale a MainLayout.razor; <Outlet /> es el @Body donde se dibuja la pantalla actual.
 *
 * Mobile-first: en pantallas chicas y medianas el menú está oculto y se abre con el botón;
 * desde LG (992 px) queda fijo a la izquierda (ver Layout.css).
 */
export function Layout() {
  // Estado del menú en pantallas chicas. Al cambiarlo, React vuelve a dibujar el componente.
  const [menuAbierto, setMenuAbierto] = useState(false);
  // "loading" mientras se descarga el código de la pantalla a la que se navega (carga diferida).
  const cargandoPantalla = useNavigation().state === 'loading';

  return (
    <div className={menuAbierto ? 'layout layout--menu-abierto' : 'layout'}>
      <AppBarComponent colorMode="Primary" cssClass="layout__barra">
        <ButtonComponent
          cssClass="e-inherit layout__boton-menu"
          iconCss="e-icons e-menu"
          aria-label={menuAbierto ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={menuAbierto}
          onClick={() => setMenuAbierto((abierto) => !abierto)}
        />
        <Link to="/" className="layout__marca">
          LigaHub
        </Link>
      </AppBarComponent>

      <aside className="layout__menu">
        <MenuNavegacion
          items={OPCIONES_MENU}
          onNavegar={() => setMenuAbierto(false)}
        />
      </aside>

      {/* Fondo oscuro detrás del menú abierto en pantallas chicas: al tocarlo, se cierra. */}
      {menuAbierto && (
        <div
          className="layout__fondo"
          onClick={() => setMenuAbierto(false)}
          aria-hidden="true"
        />
      )}

      <main className="layout__contenido">
        {cargandoPantalla && (
          <div
            className="barra-progreso"
            role="progressbar"
            aria-label="Cargando la pantalla"
          />
        )}
        <Outlet />
      </main>
    </div>
  );
}
