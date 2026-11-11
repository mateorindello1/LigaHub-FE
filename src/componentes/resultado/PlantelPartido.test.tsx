import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { EquipoPlanilla } from '../../modelos/partido';
import { PlantelPartido } from './PlantelPartido';

/** Equipo con tres jugadores; el capitán es el dorsal 10 y el 5 está suspendido. */
const EQUIPO: EquipoPlanilla = {
  id: 1,
  nombre: 'Los Halcones',
  escudoURL: null,
  plantel: [1, 5, 10].map((dorsal) => ({
    inscripcionJugadorId: `i${dorsal}`,
    jugadorId: dorsal,
    nombres: 'Jugador',
    apellidos: `Número ${dorsal}`,
    dorsal,
    capitan: dorsal === 10,
    jugo: false,
    suspendido: dorsal === 5,
  })),
};

/** Test de componente del plantel con las casillas "jugó" (CheckBox de Syncfusion). */
describe('PlantelPartido', () => {
  function dibujar(jugaron: string[], deshabilitado = false) {
    const onCambiar = vi.fn();
    const onTodos = vi.fn();
    render(
      <PlantelPartido
        equipo={EQUIPO}
        jugaron={new Set(jugaron)}
        onCambiar={onCambiar}
        onTodos={onTodos}
        deshabilitado={deshabilitado}
      />,
    );
    return { onCambiar, onTodos };
  }

  it('cuenta los que jugaron y marca sus casillas', () => {
    // Act
    dibujar(['i1', 'i10']);

    // Assert
    expect(screen.getByText('Jugaron 2 de 3')).toBeInTheDocument();
    expect(screen.getByLabelText('1 · Número 1, Jugador')).toBeChecked();
    expect(
      screen.getByLabelText('5 · Número 5, Jugador — suspendido'),
    ).not.toBeChecked();
    expect(screen.getByLabelText('10 · Número 10, Jugador (C)')).toBeChecked();
  });

  it('al marcar una casilla avisa qué jugador y si jugó', async () => {
    // Arrange
    const { onCambiar } = dibujar([]);

    // Act
    await userEvent.click(screen.getByLabelText('1 · Número 1, Jugador'));

    // Assert
    expect(onCambiar).toHaveBeenCalledWith('i1', true);
  });

  it('"Todos" y "Ninguno" avisan para todo el plantel', async () => {
    // Arrange
    const { onTodos } = dibujar([]);

    // Act
    await userEvent.click(screen.getByRole('button', { name: 'Todos' }));
    await userEvent.click(screen.getByRole('button', { name: 'Ninguno' }));

    // Assert
    expect(onTodos).toHaveBeenNthCalledWith(1, true);
    expect(onTodos).toHaveBeenNthCalledWith(2, false);
  });

  it('deshabilitado (torneo finalizado) no permite cambiar nada', () => {
    // Act
    dibujar([], true);

    // Assert
    expect(screen.getByRole('button', { name: 'Todos' })).toBeDisabled();
    expect(
      screen.getByLabelText('5 · Número 5, Jugador — suspendido'),
    ).toBeDisabled();
  });

  it('un suspendido no se puede anotar, pero si figura como que jugó se lo puede sacar', () => {
    // Act: primero sin marcar; después, marcado (una planilla cargada antes de la sanción).
    const { unmount } = render(
      <PlantelPartido
        equipo={EQUIPO}
        jugaron={new Set()}
        onCambiar={vi.fn()}
        onTodos={vi.fn()}
      />,
    );
    const sinMarcar = screen.getByLabelText(
      '5 · Número 5, Jugador — suspendido',
    );
    expect(sinMarcar).toBeDisabled();
    unmount();
    dibujar(['i5']);

    // Assert
    expect(
      screen.getByLabelText('5 · Número 5, Jugador — suspendido'),
    ).toBeEnabled();
    expect(screen.getByLabelText('1 · Número 1, Jugador')).toBeEnabled();
  });
});
