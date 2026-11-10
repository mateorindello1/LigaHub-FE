import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { TipoEvento, type EventoACargar } from '../../modelos/partido';
import { ListaEventos, type JugadorDeEvento } from './ListaEventos';

const JUGADORES: Record<string, JugadorDeEvento> = {
  a: { nombre: 'Díaz, Matías', equipo: 'Los Halcones' },
  b: { nombre: 'Romero, Lucas', equipo: 'Los Halcones' },
  c: { nombre: 'Sosa, Tomás', equipo: 'Deportivo Sur' },
};

const EVENTOS: EventoACargar[] = [
  {
    tipoEvento: TipoEvento.Gol,
    minuto: 12,
    inscripcionJugadorId: 'a',
    inscripcionJugadorEntraId: null,
  },
  {
    tipoEvento: TipoEvento.Amonestacion,
    minuto: 30,
    inscripcionJugadorId: 'c',
    inscripcionJugadorEntraId: null,
  },
  {
    tipoEvento: TipoEvento.Cambio,
    minuto: 60,
    inscripcionJugadorId: 'a',
    inscripcionJugadorEntraId: 'b',
  },
];

/** Test de componente de la lista de eventos de la planilla. */
describe('ListaEventos', () => {
  it('muestra cada evento con su minuto, su tipo, el jugador y su equipo', () => {
    // Act
    render(<ListaEventos eventos={EVENTOS} jugador={(id) => JUGADORES[id]} />);

    // Assert
    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(3);
    expect(items[0]).toHaveTextContent("12'GolDíaz, Matías (Los Halcones)");
    expect(items[2]).toHaveTextContent(
      'Sale Díaz, Matías, entra Romero, Lucas (Los Halcones)',
    );
  });

  it('sin eventos muestra un mensaje en lugar de la lista', () => {
    // Act
    render(<ListaEventos eventos={[]} jugador={(id) => JUGADORES[id]} />);

    // Assert
    expect(screen.getByText('Todavía no hay eventos.')).toBeInTheDocument();
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  it('con onQuitar, cada evento tiene un botón que avisa su posición', async () => {
    // Arrange
    const onQuitar = vi.fn();
    render(
      <ListaEventos
        eventos={EVENTOS}
        jugador={(id) => JUGADORES[id]}
        onQuitar={onQuitar}
      />,
    );

    // Act
    const segundo = screen.getAllByRole('listitem')[1];
    await userEvent.click(within(segundo).getByRole('button'));

    // Assert
    expect(onQuitar).toHaveBeenCalledWith(1);
  });

  it('sin onQuitar la lista es de solo lectura', () => {
    // Act
    const { container } = render(
      <ListaEventos eventos={EVENTOS} jugador={(id) => JUGADORES[id]} />,
    );

    // Assert: se busca dentro del componente. Sin licencia (como en los tests), Syncfusion agrega
    // al body un aviso con su propio botón de cerrar.
    expect(within(container).queryByRole('button')).not.toBeInTheDocument();
  });
});
