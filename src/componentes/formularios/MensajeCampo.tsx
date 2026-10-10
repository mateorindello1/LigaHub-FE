interface Props {
  id: string;
  error?: string;
  ayuda?: string;
}

/** Texto debajo de un campo: el error si lo hay; si no, la ayuda. */
export function MensajeCampo({ id, error, ayuda }: Props) {
  if (error) {
    return (
      <span id={id} className="campo__error" role="alert">
        {error}
      </span>
    );
  }
  if (!ayuda) return null;
  return (
    <span id={id} className="campo__ayuda">
      {ayuda}
    </span>
  );
}
