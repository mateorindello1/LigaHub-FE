import { EncabezadoPagina } from '../componentes/comunes/EncabezadoPagina';

interface Props {
  titulo: string;
  /** Etapa del plan de desarrollo en la que se implementa la pantalla. */
  etapa: number;
}

/** Pantalla provisoria para las secciones que todavía no están implementadas. */
export function EnConstruccionPagina({ titulo, etapa }: Props) {
  return (
    <>
      <EncabezadoPagina titulo={titulo} />
      <p>
        Esta pantalla se implementa en la etapa {etapa} del plan de desarrollo.
      </p>
    </>
  );
}
