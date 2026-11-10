# Tests del frontend

El frontend tiene dos tipos de tests:

| Tipo | Qué prueba | Herramientas | Dónde | Comando |
|:--|:--|:--|:--|:--|
| **Componentes y unitarios** | Cada componente por separado, dibujado en un DOM simulado (jsdom) y usado como lo haría una persona: escribiendo y tocando botones. También funciones puras y esquemas de validación | [Vitest](https://vitest.dev/) + [Testing Library](https://testing-library.com/docs/react-testing-library/intro/) | `src/**/*.test.ts(x)`, junto al código que prueban | `pnpm test` |
| **End-to-end** | La aplicación completa en un navegador real, con la API y la base de Azure: recorridos de punta a punta | [Playwright](https://playwright.dev/) con Microsoft Edge | `e2e/*.spec.ts` | `pnpm test:e2e` |

Los tests del backend (unitarios y de integración de la API) están en el repositorio [LigaHub-BE](https://github.com/mateorindello1/LigaHub-BE/blob/main/docs/tests.md).

Equivalencias con .NET:
- Los tests de componentes son los de **bUnit** en Blazor.
- Los end-to-end son los de **Playwright para .NET** o Selenium.

## Cómo correrlos

```bash
pnpm test            # componentes y unitarios (unos segundos)
pnpm test:watch      # lo mismo, y se vuelven a correr al guardar
pnpm test:cov        # con cobertura (reporte HTML en coverage/index.html)
pnpm test:e2e        # end-to-end (unos 30 segundos)
```

Para los end-to-end:

- **Navegador:** usan el **Microsoft Edge** instalado (`channel: 'msedge'` en `playwright.config.ts`), así que no hace falta descargar navegadores.
- **Servidores:** levantan solos el frontend (`pnpm dev`) y la API (`pnpm start` en `../LigaHub-BE`, el repositorio hermano). Si ya están corriendo, los reutilizan.
- **Datos:** la base de Azure tiene que tener los datos del seed (`pnpm db:seed` en el backend).
- **Contraseña:** los tests inician sesión con los usuarios del seed. La contraseña se lee de `E2E_CONTRASENIA` (`.env` del frontend) o, si no está, de `SEED_CONTRASENIA` en `../LigaHub-BE/.env`. Nunca está en el código.
- **Reporte:** queda en `playwright-report/index.html` (`pnpm exec playwright show-report`). Si un test falla, en `test-results/` quedan la captura de pantalla y la traza paso a paso (`pnpm exec playwright show-trace <archivo>`).

**Datos de prueba:** dos tests modifican datos del seed y los restauran: el fixture de Clausura y el resultado de un partido. La limpieza está en `afterEach`, que corre aunque el test falle o se pase del tiempo. Los tests corren de a uno (`workers: 1`), porque comparten la base.

## Qué cubren

### Componentes y unitarios (26 tests en 6 archivos)

| Archivo | Qué prueba |
|:--|:--|
| `componentes/torneos/FormularioTorneo.test.tsx` | Formulario con los campos de Syncfusion: errores de validación sin enviar; datos válidos que salen por `onGuardar` sin espacios sobrantes (**output property**); carga del torneo recibido (**input property**); error 409 del backend en el formulario; `onCancelar` |
| `componentes/sesion/RutaProtegida.test.tsx` | Protección de rutas por rol: sin sesión lleva al login (y recuerda a qué pantalla volver); con otro rol lleva a la página principal; con el rol, la pantalla; mientras se recupera la sesión, nada |
| `api/cliente-api.test.ts` | Renovación del token de acceso con `fetch` simulado: ante un 401 renueva y reintenta; si no puede, cierra la sesión; renueva antes de que venza; un solo refresco para varios pedidos simultáneos; la cookie viaja en todos (`credentials: 'include'`) |
| `componentes/resultado/PlantelPartido.test.tsx` | Casillas "jugó" (CheckBox de Syncfusion): cuenta y marca a los que jugaron, avisa cada cambio, "Todos" y "Ninguno", deshabilitado con el torneo finalizado |
| `componentes/resultado/ListaEventos.test.tsx` | Eventos del partido con minuto, tipo, jugador y equipo; lista vacía; botón para quitar que avisa la posición; solo lectura sin `onQuitar` |
| `utilidades/utilidades.test.ts` | Marcador calculado a partir de los goles; búsqueda sin tildes; diferencia de gol con signo; esquema del evento (regla del cambio y minuto) |

### End-to-end (5 tests en 4 archivos)

| Archivo | Recorrido |
|:--|:--|
| `navegacion-publica.spec.ts` | Sin sesión: Posiciones (listado con filtro) → detalle de un equipo con sus partidos y jugadores. Una pantalla de administración lleva al login |
| `fixture.spec.ts` | **Caso de uso 1**: el Administrador inicia sesión, genera el fixture de Clausura con ida y vuelta (6 fechas, 12 partidos), comprueba que se cerraron las inscripciones y que la tabla tiene los 4 equipos, y lo deshace |
| `sesion.spec.ts` | La sesión sobrevive a recargar la página (se recupera con la cookie `httpOnly`); ningún token queda al alcance del JavaScript; "Salir" la revoca en la API |
| `resultado.spec.ts` | **Caso de uso 2**: el Asistente inicia sesión, abre la planilla de un partido programado, marca a los jugadores, agrega un gol (el marcador pasa a 1 - 0), guarda con confirmación, ve el resultado en el fixture y lo anula |

## Evidencia de ejecución

### Integración continua (GitHub Actions)

En cada push y pull request a `main`, el workflow [`.github/workflows/tests.yml`](../.github/workflows/tests.yml) corre en GitHub:
1. Instala las dependencias.
2. Corre el lint.
3. Compila (con la verificación de tipos).
4. Ejecuta los tests de componentes con cobertura.

El reporte de cobertura queda como artefacto de cada ejecución, en la pestaña [Actions](https://github.com/mateorindello1/LigaHub-FE/actions).

Los end-to-end no corren en GitHub: necesitan la API y la base de Azure, que solo acepta conexiones de las IP habilitadas en su firewall. Se corren en local.

### Última ejecución local (2026-11-10)

**Componentes y unitarios** (`pnpm test`):

```
 Test Files  6 passed (6)
      Tests  26 passed (26)
```

**End-to-end** (`pnpm test:e2e`, con la API y la base de Azure):

```
Running 5 tests using 1 worker
  ok 1 e2e\fixture.spec.ts:25:1 › el Administrador genera el fixture, ve las posiciones y lo deshace (10.7s)
  ok 2 e2e\navegacion-publica.spec.ts:8:3 › Navegación pública › posiciones → detalle del equipo con sus partidos y jugadores (2.9s)
  ok 3 e2e\navegacion-publica.spec.ts:40:3 › Navegación pública › una pantalla de administración lleva al login (1.5s)
  ok 4 e2e\resultado.spec.ts:23:1 › el Asistente carga un resultado con un gol y lo anula (8.6s)
  ok 5 e2e\sesion.spec.ts:8:1 › la sesión sobrevive a una recarga, no deja tokens al alcance del JavaScript y "Salir" la revoca (3.4s)
  5 passed (37.7s)
```

Después de las corridas, la base quedó como el seed: Clausura en inscripción y los partidos de Apertura en sus estados originales.

**Sobre la cobertura de `pnpm test:cov`** (7,6 % de las líneas): mide solo los tests de componentes, que prueban piezas sueltas. Las pantallas completas (`src/paginas`) las recorren los end-to-end en el navegador, que Vitest no puede medir.
