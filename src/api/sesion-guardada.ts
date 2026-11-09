import type { RespuestaLogin, UsuarioSesion } from '../modelos/sesion';

/** Sesión activa: el token, su vencimiento y el usuario. */
export type Sesion = RespuestaLogin;

/** Motivo por el que terminó la última sesión. */
export type MotivoCierre = 'cierre' | 'vencida';

const CLAVE = 'ligahub.sesion';

/**
 * Lee la sesión de sessionStorage. Devuelve null si no hay, si está dañada o si ya venció.
 * sessionStorage puede no estar disponible (por ejemplo, con el almacenamiento bloqueado):
 * en ese caso la sesión vive solo en memoria.
 */
function leerGuardada(): Sesion | null {
  try {
    const texto = sessionStorage.getItem(CLAVE);
    if (!texto) return null;
    const sesion = JSON.parse(texto) as Sesion;
    if (!sesion.token || new Date(sesion.expira).getTime() <= Date.now()) {
      sessionStorage.removeItem(CLAVE);
      return null;
    }
    return sesion;
  } catch {
    return null;
  }
}

let actual: Sesion | null = leerGuardada();
let ultimoMotivo: MotivoCierre | null = null;
const suscriptores = new Set<() => void>();

function avisar() {
  suscriptores.forEach((avisarCambio) => avisarCambio());
}

/**
 * Sesión guardada en memoria y en sessionStorage: dura mientras la pestaña esté abierta
 * (decisión de docs/seguridad.md del backend).
 *
 * Es un "almacén externo" a React con suscriptores (patrón Observer): lo usa el cliente de API
 * para enviar el token, y los componentes lo leen con useSyncExternalStore para volver a
 * dibujarse cuando cambia. Equivale a un servicio singleton con un evento OnChange en Blazor.
 */
export const sesionGuardada = {
  /** Sesión activa, o null. */
  obtener: (): Sesion | null => actual,

  /** Motivo del último cierre (para avisar "tu sesión venció"). */
  ultimoMotivo: (): MotivoCierre | null => ultimoMotivo,

  guardar(sesion: Sesion) {
    actual = sesion;
    ultimoMotivo = null;
    try {
      sessionStorage.setItem(CLAVE, JSON.stringify(sesion));
    } catch {
      // Sin almacenamiento disponible: la sesión queda solo en memoria.
    }
    avisar();
  },

  /** Actualiza los datos del usuario (por ejemplo, roles nuevos) sin cambiar el token. */
  actualizarUsuario(usuario: UsuarioSesion) {
    if (actual) this.guardar({ ...actual, usuario });
  },

  borrar(motivo: MotivoCierre) {
    if (!actual) return;
    actual = null;
    ultimoMotivo = motivo;
    try {
      sessionStorage.removeItem(CLAVE);
    } catch {
      // Nada que borrar.
    }
    avisar();
  },

  /** Registra una función que se llama con cada cambio. Devuelve la función para desuscribirse. */
  suscribir(avisarCambio: () => void) {
    suscriptores.add(avisarCambio);
    return () => {
      suscriptores.delete(avisarCambio);
    };
  },
};
