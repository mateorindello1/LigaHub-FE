import { describe, expect, it } from 'vitest';
import { TipoEvento } from '../modelos/partido';
import { esquemaEvento } from '../validaciones/evento.validacion';
import {
  esDireccionWeb,
  TAMANIO_MAXIMO_FOTO,
  validarFotoPerfil,
} from '../validaciones/foto-perfil.validacion';
import { formatearDiferencia, normalizarParaBuscar } from './formato';
import { inicialesDe } from './iniciales';
import { calcularMarcador } from './marcador';

/** Tests unitarios de la lógica sin componentes: funciones puras y esquemas de validación. */

describe('calcularMarcador', () => {
  // Inscripciones que empiezan con "L" son del local.
  const esLocal = (id: string) => id.startsWith('L');

  it('cada gol suma a su equipo y cada gol en contra, al rival', () => {
    // Act
    const marcador = calcularMarcador(
      [
        { tipoEvento: TipoEvento.Gol, inscripcionJugadorId: 'L1' },
        { tipoEvento: TipoEvento.Gol, inscripcionJugadorId: 'V1' },
        { tipoEvento: TipoEvento.GolEnContra, inscripcionJugadorId: 'V2' },
        { tipoEvento: TipoEvento.Amonestacion, inscripcionJugadorId: 'L1' },
      ],
      esLocal,
    );

    // Assert
    expect(marcador).toEqual({ golesLocal: 2, golesVisitante: 1 });
  });
});

describe('formato', () => {
  it('normalizarParaBuscar quita tildes y mayúsculas', () => {
    expect(normalizarParaBuscar('Gómez ÁLVAREZ')).toBe('gomez alvarez');
  });

  it('formatearDiferencia agrega el signo a las diferencias positivas', () => {
    expect(formatearDiferencia(3)).toBe('+3');
    expect(formatearDiferencia(0)).toBe('0');
    expect(formatearDiferencia(-2)).toBe('-2');
  });
});

describe('esquemaEvento', () => {
  const base = {
    tipoEvento: TipoEvento.Cambio,
    minuto: 60,
    inscripcionJugadorId: 'a',
  };

  /** Mensajes de error del esquema, o [] si los datos son válidos. */
  const errores = (datos: unknown) => {
    const resultado = esquemaEvento.safeParse(datos);
    return resultado.success
      ? []
      : resultado.error.issues.map((i) => i.message);
  };

  it('un cambio necesita al jugador que entra, y que sea otro', () => {
    expect(errores({ ...base, inscripcionJugadorEntraId: null })).toEqual([
      'Elegí el jugador que entra.',
    ]);
    expect(errores({ ...base, inscripcionJugadorEntraId: 'a' })).toEqual([
      'El jugador que entra tiene que ser otro.',
    ]);
    expect(errores({ ...base, inscripcionJugadorEntraId: 'b' })).toEqual([]);
  });

  it('el minuto va de 0 a 130', () => {
    const gol = { ...base, tipoEvento: TipoEvento.Gol };
    expect(errores({ ...gol, minuto: 131 })).toEqual([
      'El minuto tiene que ser un entero entre 0 y 130.',
    ]);
    expect(errores({ ...gol, minuto: 0 })).toEqual([]);
  });
});

describe('validarFotoPerfil', () => {
  /** Archivo de prueba con el tipo y el tamaño indicados. */
  const archivo = (tipo: string, tamanio = 1024) =>
    new File([new Uint8Array(tamanio)], 'foto', { type: tipo });

  it.each(['image/jpeg', 'image/png', 'image/webp'])('acepta %s', (tipo) => {
    // Act y Assert
    expect(validarFotoPerfil(archivo(tipo))).toBeNull();
  });

  it('rechaza otros tipos de archivo', () => {
    // Act y Assert
    expect(validarFotoPerfil(archivo('image/gif'))).toContain(
      'JPG, PNG o WebP',
    );
    expect(validarFotoPerfil(archivo('application/pdf'))).not.toBeNull();
  });

  it('rechaza un archivo de más de 2 MB', () => {
    // Act y Assert
    expect(
      validarFotoPerfil(archivo('image/png', TAMANIO_MAXIMO_FOTO + 1)),
    ).toContain('2 MB');
  });
});

describe('inicialesDe', () => {
  it('usa el nombre y el apellido del jugador asociado', () => {
    // Act y Assert
    expect(
      inicialesDe({
        email: 'jugador@ligahub.test',
        jugador: { id: 1, nombres: 'matías', apellidos: 'Díaz' },
      }),
    ).toBe('MD');
  });

  it('sin jugador, usa la primera letra del email', () => {
    // Act y Assert
    expect(
      inicialesDe({ email: 'asistente@ligahub.test', jugador: null }),
    ).toBe('A');
  });
});

describe('esDireccionWeb', () => {
  it.each([
    ['https://ejemplo.com/foto.png', true],
    ['  http://ejemplo.com/a.jpg  ', true],
    ['ftp://ejemplo.com/foto.png', false],
    ['javascript:alert(1)', false],
    ['ejemplo.com/foto.png', false],
    ['', false],
  ])('"%s" → %s', (texto, esperado) => {
    // Act y Assert
    expect(esDireccionWeb(texto)).toBe(esperado);
  });
});
