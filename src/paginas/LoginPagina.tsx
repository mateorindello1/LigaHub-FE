import { useForm } from 'react-hook-form';
import { Navigate, useNavigate, useSearchParams } from 'react-router';
import { zodResolver } from '@hookform/resolvers/zod';
import { ButtonComponent } from '@syncfusion/ej2-react-buttons';
import { MensajeError } from '../componentes/comunes/MensajeError';
import { CampoTexto } from '../componentes/formularios/CampoTexto';
import { mostrarErrorDelServidor } from '../componentes/formularios/errores-servidor';
import { useNotificaciones } from '../componentes/notificaciones/contexto-notificaciones';
import { useSesion } from '../componentes/sesion/contexto-sesion';
import {
  esquemaLogin,
  type DatosFormularioLogin,
} from '../validaciones/login.validacion';

/**
 * Devuelve la ruta a la que volver después del login (?volver=/torneos), solo si es una ruta
 * propia de la aplicación. Así un enlace armado por un tercero no puede mandar al usuario a
 * otro sitio después de iniciar sesión (redirección abierta).
 */
function rutaDeVuelta(volver: string | null): string {
  return volver?.startsWith('/') && !volver.startsWith('//') ? volver : '/';
}

/** Pantalla de inicio de sesión. */
export function LoginPagina() {
  const { usuario, iniciarSesion } = useSesion();
  const notificaciones = useNotificaciones();
  const navegar = useNavigate();
  const [parametros] = useSearchParams();
  const destino = rutaDeVuelta(parametros.get('volver'));

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<DatosFormularioLogin>({
    resolver: zodResolver(esquemaLogin),
    defaultValues: { email: '', contrasenia: '' },
  });

  const enviar = handleSubmit(async (datos) => {
    try {
      const usuarioIniciado = await iniciarSesion(datos);
      notificaciones.exito(`Hola, ${usuarioIniciado.email}.`);
      // replace: con "Atrás" no se vuelve a la pantalla de login.
      navegar(destino, { replace: true });
    } catch (error) {
      // 401 (credenciales inválidas), 429 (demasiados intentos) o sin conexión.
      mostrarErrorDelServidor(error, setError, ['email', 'contrasenia']);
    }
  });

  // Si ya inició sesión (por ejemplo, entró a /login con la sesión abierta), no hay nada que hacer.
  // La notificación de éxito se muestra antes de navegar, así que no hay que repetirla acá.
  if (usuario && !isSubmitting) {
    return <Navigate to={destino} replace />;
  }

  return (
    <div className="pagina-login">
      <title>Iniciar sesión · LigaHub</title>
      <article className="e-card tarjeta-login">
        <div className="e-card-header">
          <div className="e-card-header-caption">
            <h1 className="e-card-header-title">Iniciar sesión</h1>
            <p className="e-card-sub-title">
              Para administrar torneos, equipos y resultados.
            </p>
          </div>
        </div>
        <div className="e-card-content">
          <form onSubmit={enviar} noValidate>
            <CampoTexto
              control={control}
              nombre="email"
              etiqueta="Email"
              tipo="email"
              autocompletar="username"
            />
            <CampoTexto
              control={control}
              nombre="contrasenia"
              etiqueta="Contraseña"
              tipo="password"
              autocompletar="current-password"
            />
            {errors.root?.servidor && (
              <MensajeError error={errors.root.servidor.message} />
            )}
            <ButtonComponent
              type="submit"
              isPrimary
              cssClass="tarjeta-login__boton"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Ingresando…' : 'Ingresar'}
            </ButtonComponent>
          </form>
        </div>
      </article>
      <p className="texto-secundario tarjeta-login__nota">
        Para consultar torneos, posiciones y fixture no hace falta iniciar
        sesión.
      </p>
    </div>
  );
}
