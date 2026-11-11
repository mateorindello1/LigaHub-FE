import type { RespuestaLogin, UsuarioSesion } from '../modelos/sesion';

/** Sesión activa: el token de acceso, su vencimiento y el usuario. */
export type Sesion = RespuestaLogin;

/** Motivo por el que terminó la última sesión. */
export type MotivoCierre = 'cierre' | 'vencida';

/** Canal entre pestañas: al cerrar la sesión en una, se cierra en las demás. */
const NOMBRE_CANAL = 'ligahub.sesion';

let actual: Sesion | null = null;
let verificada = false;
let ultimoMotivo: MotivoCierre | null = null;
const suscriptores = new Set<() => void>();

function avisar() {
  suscriptores.forEach((avisarCambio) => avisarCambio());
}

/** BroadcastChannel puede no existir (por ejemplo, en los tests con jsdom). */
const canal =
  typeof BroadcastChannel === 'undefined'
    ? null
    : new BroadcastChannel(NOMBRE_CANAL);

/**
 * Sesión activa, **solo en memoria**: el token de acceso no se guarda en sessionStorage ni en
 * localStorage, donde un script inyectado (XSS) podría leerlo. Al recargar la página se pierde,
 * y se recupera pidiendo uno nuevo con la cookie httpOnly del token de refresco (ver
 * refresco-sesion.ts).
 *
 * Es un "almacén externo" a React con suscriptores (patrón Observer): lo usa el cliente de API
 * para enviar el token, y los componentes lo leen con useSyncExternalStore para volver a
 * dibujarse cuando cambia. Equivale a un servicio singleton con un evento OnChange en Blazor.
 */
export const sesionGuardada = {
  /** Sesión activa, o null. */
  obtener: (): Sesion | null => actual,

  /**
   * Indica si ya se intentó recuperar la sesión al abrir la aplicación. Hasta entonces no se sabe
   * si hay sesión, y las pantallas protegidas esperan en lugar de mandar al login.
   */
  estaVerificada: (): boolean => verificada,

  marcarVerificada() {
    if (verificada) return;
    verificada = true;
    avisar();
  },

  /** Motivo del último cierre (para avisar "tu sesión venció"). */
  ultimoMotivo: (): MotivoCierre | null => ultimoMotivo,

  guardar(sesion: Sesion) {
    actual = sesion;
    ultimoMotivo = null;
    avisar();
  },

  /** Actualiza los datos del usuario (por ejemplo, su foto nueva) sin cambiar el token. */
  actualizarUsuario(usuario: UsuarioSesion) {
    if (actual) this.guardar({ ...actual, usuario });
  },

  /**
   * Cierra la sesión en esta pestaña. Si la cerró el usuario, avisa a las demás pestañas para
   * que también la cierren.
   * @param avisarPestanias false cuando el aviso viene de otra pestaña (para no reenviarlo).
   */
  borrar(motivo: MotivoCierre, avisarPestanias = true) {
    if (!actual) return;
    actual = null;
    ultimoMotivo = motivo;
    if (motivo === 'cierre' && avisarPestanias) canal?.postMessage('cierre');
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

// Cierre de sesión en otra pestaña: el token de refresco ya se revocó, así que esta también cierra.
canal?.addEventListener('message', (evento: MessageEvent) => {
  if (evento.data === 'cierre') sesionGuardada.borrar('cierre', false);
});
