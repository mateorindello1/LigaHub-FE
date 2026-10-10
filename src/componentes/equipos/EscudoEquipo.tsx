import { useState } from 'react';

interface Props {
  nombre: string;
  escudoURL: string | null;
  /** Lado en píxeles (por defecto, 32). */
  tamanio?: number;
}

/** Iniciales de un nombre: "Los Pibes FC" → "LP". */
function iniciales(nombre: string): string {
  return nombre
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((palabra) => palabra[0].toUpperCase())
    .join('');
}

/**
 * Escudo del equipo. Si no tiene, o si la imagen no carga, muestra un círculo con las iniciales.
 */
export function EscudoEquipo({ nombre, escudoURL, tamanio = 32 }: Props) {
  // Guarda la URL que falló: si cambia la URL (por ejemplo, al editar), se vuelve a intentar.
  const [urlConError, setUrlConError] = useState<string | null>(null);
  const estilo = { width: tamanio, height: tamanio };

  if (escudoURL && escudoURL !== urlConError) {
    return (
      <img
        className="escudo"
        style={estilo}
        src={escudoURL}
        alt={`Escudo de ${nombre}`}
        onError={() => setUrlConError(escudoURL)}
      />
    );
  }

  return (
    <span
      className="escudo escudo--iniciales"
      style={{ ...estilo, fontSize: tamanio * 0.4 }}
      aria-hidden="true"
    >
      {iniciales(nombre)}
    </span>
  );
}
