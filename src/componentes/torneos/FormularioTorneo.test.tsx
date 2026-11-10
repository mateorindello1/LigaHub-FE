import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { ErrorApi } from '../../api/error-api';
import { FormularioTorneo } from './FormularioTorneo';

/**
 * Test de componente del formulario de torneo: se dibuja el componente real (con los campos de
 * Syncfusion) en un DOM simulado y se usa como lo haría una persona: escribiendo y tocando botones.
 * Es el equivalente de un test de bUnit en Blazor.
 */
describe('FormularioTorneo', () => {
  /** Dibuja el formulario con funciones simuladas para las output properties. */
  function dibujar(
    props: Partial<Parameters<typeof FormularioTorneo>[0]> = {},
  ) {
    const onGuardar = vi.fn().mockResolvedValue(undefined);
    const onCancelar = vi.fn();
    render(
      <FormularioTorneo
        onGuardar={onGuardar}
        onCancelar={onCancelar}
        {...props}
      />,
    );
    return { onGuardar, onCancelar, usuario: userEvent.setup() };
  }

  it('muestra los errores de validación y no guarda si el nombre está vacío', async () => {
    // Arrange
    const { onGuardar, usuario } = dibujar();

    // Act
    await usuario.click(screen.getByRole('button', { name: 'Guardar' }));

    // Assert
    expect(
      await screen.findByText('El nombre es obligatorio.'),
    ).toBeInTheDocument();
    expect(onGuardar).not.toHaveBeenCalled();
  });

  it('con datos válidos avisa por onGuardar con el nombre sin espacios sobrantes', async () => {
    // Arrange
    const { onGuardar, usuario } = dibujar();

    // Act
    await usuario.type(screen.getByLabelText('Nombre'), '  Apertura  ');
    await usuario.click(screen.getByRole('button', { name: 'Guardar' }));

    // Assert
    await waitFor(() =>
      expect(onGuardar).toHaveBeenCalledWith({
        nombre: 'Apertura',
        anio: new Date().getFullYear(),
      }),
    );
  });

  it('al modificar, carga los datos del torneo recibido (input property)', () => {
    // Arrange y Act
    dibujar({
      torneo: { id: 7, nombre: 'Clausura', anio: 2025, estadoTorneo: 1 },
    });

    // Assert
    expect(screen.getByLabelText('Nombre')).toHaveValue('Clausura');
  });

  it('muestra en el formulario el error que devuelve el backend', async () => {
    // Arrange: el backend responde 409 con un mensaje.
    const onGuardar = vi
      .fn()
      .mockRejectedValue(
        new ErrorApi(409, 'Ya existe un torneo con ese nombre.'),
      );
    const { usuario } = dibujar({ onGuardar });

    // Act
    await usuario.type(screen.getByLabelText('Nombre'), 'Apertura');
    await usuario.click(screen.getByRole('button', { name: 'Guardar' }));

    // Assert
    expect(
      await screen.findByText('Ya existe un torneo con ese nombre.'),
    ).toBeInTheDocument();
  });

  it('Cancelar avisa por onCancelar (output property)', async () => {
    // Arrange
    const { onCancelar, onGuardar, usuario } = dibujar();

    // Act
    await usuario.click(screen.getByRole('button', { name: 'Cancelar' }));

    // Assert
    expect(onCancelar).toHaveBeenCalledOnce();
    expect(onGuardar).not.toHaveBeenCalled();
  });
});
