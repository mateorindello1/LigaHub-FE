import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { describe, expect, it, vi } from 'vitest';
import { Rol, type UsuarioSesion } from '../../modelos/sesion';
import { ContextoSesion, type ContextoSesionValor } from './contexto-sesion';
import { RutaProtegida } from './RutaProtegida';

/**
 * Test de componente de la protección de rutas por rol: con un router en memoria (sin navegador)
 * y una sesión simulada se comprueba qué ve cada usuario al entrar a una pantalla del Administrador.
 */

/** Usuario de prueba con los roles indicados. */
function usuarioCon(...roles: Rol[]): UsuarioSesion {
  return {
    id: 1,
    email: 'prueba@ligahub.test',
    fotoPerfilURL: null,
    jugadorId: null,
    jugador: null,
    roles,
  };
}

/**
 * Dibuja la aplicación en /torneos, una pantalla protegida para el Administrador, con la sesión
 * indicada (null: sin sesión).
 */
function entrarATorneos(usuario: UsuarioSesion | null, verificando = false) {
  const sesion: ContextoSesionValor = {
    usuario,
    verificando,
    iniciarSesion: vi.fn(),
    cerrarSesion: vi.fn(),
    tieneRol: (...roles) =>
      usuario !== null && usuario.roles.some((rol) => roles.includes(rol)),
  };
  const router = createMemoryRouter(
    [
      {
        element: <RutaProtegida roles={[Rol.Administrador]} />,
        children: [{ path: '/torneos', element: <h1>Pantalla de torneos</h1> }],
      },
      { path: '/login', element: <h1>Pantalla de login</h1> },
      { path: '/', element: <h1>Página principal</h1> },
    ],
    { initialEntries: ['/torneos'] },
  );
  render(
    <ContextoSesion.Provider value={sesion}>
      <RouterProvider router={router} />
    </ContextoSesion.Provider>,
  );
  return router;
}

describe('RutaProtegida', () => {
  it('sin sesión lleva al login y recuerda a qué pantalla volver', () => {
    // Act
    const router = entrarATorneos(null);

    // Assert
    expect(screen.getByText('Pantalla de login')).toBeInTheDocument();
    expect(router.state.location.search).toBe('?volver=%2Ftorneos');
  });

  it('con sesión pero sin el rol lleva a la página principal', () => {
    // Act
    const router = entrarATorneos(usuarioCon(Rol.Jugador));

    // Assert
    expect(screen.getByText('Página principal')).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/');
    expect(screen.queryByText('Pantalla de torneos')).not.toBeInTheDocument();
  });

  it('mientras se recupera la sesión no muestra nada ni lleva al login', () => {
    // Act
    const router = entrarATorneos(null, true);

    // Assert
    expect(router.state.location.pathname).toBe('/torneos');
    expect(screen.queryByText('Pantalla de login')).not.toBeInTheDocument();
    expect(screen.queryByText('Pantalla de torneos')).not.toBeInTheDocument();
  });

  it('con el rol requerido muestra la pantalla', () => {
    // Act
    entrarATorneos(usuarioCon(Rol.Asistente, Rol.Administrador));

    // Assert
    expect(screen.getByText('Pantalla de torneos')).toBeInTheDocument();
  });
});
