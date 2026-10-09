import type { ReactNode } from 'react';

interface Props {
  titulo: string;
  descripcion?: string;
  /** Acciones de la pantalla (por ejemplo, el botón "Nuevo"), alineadas a la derecha. */
  acciones?: ReactNode;
}

/** Título de cada pantalla, con su descripción y sus acciones. */
export function EncabezadoPagina({ titulo, descripcion, acciones }: Props) {
  return (
    <header className="encabezado-pagina">
      <div>
        <h1>{titulo}</h1>
        {descripcion && <p>{descripcion}</p>}
      </div>
      {acciones && (
        <div className="encabezado-pagina__acciones">{acciones}</div>
      )}
    </header>
  );
}
