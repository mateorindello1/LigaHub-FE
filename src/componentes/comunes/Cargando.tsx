interface Props {
  /** Texto que acompaña al indicador. */
  texto?: string;
}

/** Indicador de carga mientras llegan los datos de la API. */
export function Cargando({ texto = 'Cargando…' }: Props) {
  return (
    <div className="cargando" role="status">
      <span className="cargando__circulo" aria-hidden="true" />
      {texto}
    </div>
  );
}
