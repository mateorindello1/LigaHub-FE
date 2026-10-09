import { NavLink } from 'react-router';

/** Una opción del menú. */
export interface ItemMenu {
  ruta: string;
  texto: string;
  /** Clase del ícono de Syncfusion (por ejemplo, "e-home"). */
  icono: string;
}

interface Props {
  /** Opciones a mostrar (input property, como un [Parameter] en Blazor). */
  items: ItemMenu[];
  /** Se avisa al elegir una opción (output property, como un EventCallback en Blazor). */
  onNavegar?: () => void;
}

/** Lista de enlaces de navegación. Marca la opción de la pantalla actual. */
export function MenuNavegacion({ items, onNavegar }: Props) {
  return (
    <nav aria-label="Navegación principal">
      <ul className="menu">
        {items.map((item) => (
          <li key={item.ruta}>
            <NavLink
              to={item.ruta}
              // "end" en el inicio: solo está activo en "/", no en todas las rutas.
              end={item.ruta === '/'}
              className={({ isActive }) =>
                isActive ? 'menu__enlace menu__enlace--activo' : 'menu__enlace'
              }
              onClick={onNavegar}
            >
              <span className={`e-icons ${item.icono}`} aria-hidden="true" />
              {item.texto}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
