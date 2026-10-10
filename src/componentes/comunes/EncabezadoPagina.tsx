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
      {/* React 19 lleva el <title> al <head>: la pestaña del navegador muestra la pantalla actual. */}
      <title>{`${titulo} · LigaHub`}</title>
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
