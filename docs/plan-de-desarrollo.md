# Plan de desarrollo — LigaHub Frontend

Registro de lo que se va haciendo, etapa por etapa: qué comandos se ejecutaron, qué archivos se crearon y para qué sirve cada cosa. Sirve para entender el proyecto y para poder rehacerlo desde cero.

Cada etapa tiene un estado: **Hecha**, **En curso** o **Pendiente**. Las etapas pendientes son una guía y pueden cambiar a medida que avancemos.

Como referencia, cada concepto se compara con su equivalente en Blazor.

El plan del backend está en [LigaHub-BE/docs/plan-de-desarrollo.md](https://github.com/mateorindello1/LigaHub-BE/blob/main/docs/plan-de-desarrollo.md).

## Índice

| # | Etapa | Estado |
|:-:|:--|:-:|
| 0 | [Repositorio local](#etapa-0--repositorio-local) | Hecha |
| 1 | [Decisiones de stack](#etapa-1--decisiones-de-stack) | Hecha |
| 2 | [Andamiaje del proyecto](#etapa-2--andamiaje-del-proyecto) | Hecha |
| 3 | [Base de la aplicación: layout, rutas, servicio de API y tipos](#etapa-3--base-de-la-aplicación-layout-rutas-servicio-de-api-y-tipos) | Hecha |
| 4 | [Pantallas CRUD: Torneo y Equipo](#etapa-4--pantallas-crud-torneo-y-equipo) | Pendiente |
| 5 | [Pantalla CRUD dependiente: Inscripción de equipo](#etapa-5--pantalla-crud-dependiente-inscripción-de-equipo) | Pendiente |
| 6 | [Listado con filtro y detalle](#etapa-6--listado-con-filtro-y-detalle) | Pendiente |
| 7 | [Caso de uso: generar el fixture](#etapa-7--caso-de-uso-generar-el-fixture) | Pendiente |
| 8 | [Revisión de requisitos de la cátedra](#etapa-8--revisión-de-requisitos-de-la-cátedra) | Pendiente |
| 9 | [Documentación y proposal](#etapa-9--documentación-y-proposal) | Pendiente |
| 10 | [Aprobación directa: login, rutas protegidas, tests y ambientes](#etapa-10--aprobación-directa-login-rutas-protegidas-tests-y-ambientes) | Pendiente |

---

## Etapa 0 — Repositorio local

**Estado:** Hecha (2026-10-09)

### Comandos

```powershell
cd C:\Users\mateo\source\repos
git clone https://github.com/mateorindello1/LigaHub-FE.git
```

### Estado del repositorio al clonarlo

| Archivo | Contenido |
|:--|:--|
| `README.md` | Una línea de descripción. Decía "Repositorio de Back-End" (se corrigió en la etapa 2) |
| `proposal.md` | La propuesta del TP, todavía con los problemas detectados (ver etapa 9) |

No tiene código ni `.gitignore`.

---

## Etapa 1 — Decisiones de stack

**Estado:** Hecha (2026-10-09)

| Decisión | Elección | Por qué | En Blazor |
|:--|:--|:--|:--|
| Framework | **React 19 + Vite + TypeScript** | Es el stack declarado del proyecto. Vite es el generador y servidor de desarrollo estándar para React | Blazor WebAssembly |
| Biblioteca de componentes | **Syncfusion para React**, tema **Material 3** | Ya la conocés de Blazor: grilla, diálogos, formularios y datepickers funcionan con los mismos conceptos, y las pantallas CRUD salen rápido. Cumple el requisito de la cátedra de seguir una biblioteca de componentes | Syncfusion para Blazor |
| Ruteo | **React Router** | React no trae rutas; es el estándar | `@page` y `NavigationManager` |
| Pedidos a la API | **Servicio propio sobre `fetch` + TanStack Query** | El servicio cumple el requisito de la cátedra ("al menos un servicio"). TanStack Query maneja caché, carga, errores y el refresco después de guardar | Servicio con `HttpClient` + `IsBusy` y recarga manual en el ViewModel |
| Formularios | **React Hook Form + Zod** | Reglas y tipo del formulario en un solo esquema; los errores de la API (`detalles` por campo) se muestran en el mismo campo con `setError`; si se cambia de biblioteca de componentes, la validación queda | `EditForm` + DataAnnotations |
| Gestor de paquetes y Node | **pnpm y Node 24** | Mismo entorno que el backend | — |

Se compararon dos opciones para los formularios: `FormValidator` de Syncfusion y React Hook Form + Zod. Se eligió la segunda porque no depende de la licencia de Syncfusion, integra los errores de la API y deriva el tipo del formulario de las reglas.

### Cuidados con Syncfusion

- **Licencia:** es comercial. Por ahora se usa una **licencia de prueba de 7 días** mientras se espera la **Community License** gratuita (condiciones en [su sitio](https://www.syncfusion.com/products/communitylicense)). La clave se carga con `registerLicense()` al iniciar la aplicación, desde la variable `VITE_SYNCFUSION_LICENSE`. **Si la gratuita no llega, el plan B es MUI**: por eso la validación (Zod) y los datos (TanStack Query) no dependen de Syncfusion.
- **No usar el `DataManager` de la grilla:** los datos se piden con TanStack Query y se le pasa a la grilla un arreglo común. Así hay un solo mecanismo de datos en la aplicación.
- **Componentes propios que envuelvan a los de Syncfusion** (por ejemplo, `<TablaTorneos>` que recibe los datos por prop y avisa la selección con una función). Es lo mismo que hacés en el trabajo con tus componentes sobre Syncfusion, y es lo que permite mostrar en la defensa input property, output property y reactividad en código propio.
- **Importar solo los módulos que se usan**, porque los paquetes son pesados.

### Pendiente fuera del código

- **Declarar React y NestJS en la proposal y pedir la aprobación del profesor.** La cátedra da soporte a Node, Express y Angular; otras tecnologías hay que informarlas y que se aprueben. Conviene hacerlo cuanto antes por la fecha de entrega.

## Etapa 2 — Andamiaje del proyecto

**Estado:** Hecha (2026-10-09)

**Objetivo:** generar el proyecto, instalar las dependencias del stack y verificar que compila y levanta.

### Conceptos

- **Vite** cumple dos funciones:
  - **En desarrollo** (`pnpm dev`) sirve la aplicación y la recarga al guardar.
  - **Al compilar** (`pnpm build`) genera los archivos estáticos (HTML, JS y CSS) en `dist/`.

  El resultado es una SPA: un solo `index.html` y JavaScript que corre en el navegador, como Blazor WebAssembly.
- **Variables de entorno en Vite:** solo se exponen al código las que empiezan con `VITE_`, y se leen con `import.meta.env.VITE_...`. **Todas terminan en el JavaScript que descarga el navegador**, así que no puede haber secretos ahí. Pasa lo mismo con el `appsettings.json` de `wwwroot` en Blazor WASM. La clave de Syncfusion es pública por diseño: Syncfusion la valida en el navegador.

### Diferencias de configuración con el backend

| Tema | Backend (Nest) | Frontend (Vite) |
|:--|:--|:--|
| Imports entre archivos propios | Terminan en `.js` (`./app.module.js`), por `module: nodenext` | **Sin extensión** (`./App`), por `moduleResolution: bundler`: Vite resuelve los archivos |
| `enum` de TypeScript | Se usan (`EstadoTorneo`) | **No se pueden usar**: `erasableSyntaxOnly` solo permite sintaxis que se borra al compilar, y un `enum` genera código. En su lugar se usan objetos `as const` con un tipo derivado (se ve en la etapa 3) |
| Decoradores | Sí (Nest los necesita) | No |

### Comandos

```powershell
# En una carpeta temporal: el generador pide confirmación si la carpeta del repo no está vacía
pnpm create vite@latest ligahub-fe --template react-ts --no-interactive
# Se copió todo al repo, menos el README

Set-Content -Path .node-version -Value "24" -NoNewline
pnpm install
pnpm add react-router @tanstack/react-query react-hook-form zod @hookform/resolvers
pnpm add @syncfusion/ej2-base @syncfusion/ej2-react-grids @syncfusion/ej2-react-inputs @syncfusion/ej2-react-buttons @syncfusion/ej2-react-popups @syncfusion/ej2-react-dropdowns @syncfusion/ej2-react-navigations @syncfusion/ej2-react-notifications @syncfusion/ej2-material3-theme
pnpm add -D prettier
```

### Dependencias instaladas

| Paquete | Para qué |
|:--|:--|
| `react`, `react-dom` | React (los instala la plantilla) |
| `react-router` | Rutas y navegación |
| `@tanstack/react-query` | Pedidos a la API con caché y refresco |
| `react-hook-form`, `zod`, `@hookform/resolvers` | Formularios, reglas de validación y la conexión entre los dos |
| `@syncfusion/ej2-base` | Núcleo de Syncfusion; de acá sale `registerLicense()` |
| `@syncfusion/ej2-react-grids` | Grilla (`GridComponent`) |
| `@syncfusion/ej2-react-inputs` | Cajas de texto, numéricas, etc. |
| `@syncfusion/ej2-react-buttons` | Botones, checkboxes |
| `@syncfusion/ej2-react-popups` | Diálogos (`DialogComponent`) |
| `@syncfusion/ej2-react-dropdowns` | Listas desplegables (por ejemplo, el selector de torneo) |
| `@syncfusion/ej2-react-navigations` | Menú lateral, barra de navegación, pestañas |
| `@syncfusion/ej2-react-notifications` | Avisos (`ToastComponent`) |
| `@syncfusion/ej2-material3-theme` | Tema Material 3: un solo CSS (`styles/material3.css`) con los estilos de todos los componentes |
| `prettier` (desarrollo) | Formato del código, con la misma configuración que el backend |

### Archivos creados

| Archivo | Para qué sirve | En Blazor |
|:--|:--|:--|
| `package.json` / `pnpm-lock.yaml` | Dependencias y scripts | `.csproj` / `packages.lock.json` |
| `index.html` | La única página HTML: carga `src/main.tsx` | `wwwroot/index.html` |
| `src/main.tsx` | Punto de entrada: monta el componente raíz en el HTML | `Program.cs` |
| `src/App.tsx`, `App.css`, `index.css`, `src/assets/` | Pantalla de ejemplo de la plantilla. Se reemplaza en la etapa 3 | `App.razor` |
| `public/` | Archivos que se sirven tal cual (íconos) | `wwwroot/` |
| `vite.config.ts` | Configuración de Vite. Se fijó el **puerto 5173** (`strictPort`), porque el backend solo acepta pedidos desde ese origen (CORS) | `launchSettings.json` |
| `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json` | TypeScript para el código de la app y para la configuración de Vite. Se agregó `"strict": true` explícito | Propiedades del `.csproj` |
| `.oxlintrc.json` | Linter, con las reglas de React (por ejemplo, las reglas de los hooks) | Analizadores de Roslyn |
| `.prettierrc` | Formato: comillas simples y coma final, igual que el backend | `.editorconfig` |
| `.gitignore` | El de Vite, más `.env`, `.env.*` (salvo `.env.example`) y `.obsidian/` | — |
| `.env.example` / `.env` | `VITE_API_URL` y `VITE_SYNCFUSION_LICENSE`. `.env` no se versiona | `wwwroot/appsettings.json` |
| `.node-version` | Node 24, igual que el backend | `global.json` |
| `README.md` | Se reemplazó: decía "Back-End" | — |

### Cómo probarlo

```powershell
pnpm dev
```

Y abrir `http://localhost:5173`: se ve la pantalla de ejemplo de Vite. `pnpm build` y `pnpm lint` terminan sin errores.

## Etapa 3 — Base de la aplicación: layout, rutas, servicio de API y tipos

**Estado:** Hecha (2026-10-09)

**Objetivo:** la estructura sobre la que se construyen todas las pantallas: licencia y tema de Syncfusion, layout mobile-first con menú, rutas, cliente de API con el manejo de errores del backend, servicios, tipos del dominio, notificaciones y una primera pantalla que usa la API de punta a punta.

### Estructura de carpetas

```
src/
├── api/
│   ├── claves-consulta.ts          Claves de TanStack Query (identifican cada dato en la caché)
│   ├── cliente-api.ts              fetch con URL base, JSON y conversión de errores
│   └── error-api.ts                Clase ErrorApi (estado, mensaje, detalles por campo)
├── componentes/
│   ├── comunes/                    Cargando, MensajeError (con reintentar), EncabezadoPagina
│   ├── layout/                     Layout (barra + menú + contenido) y MenuNavegacion
│   ├── notificaciones/             ProveedorNotificaciones (Toast de Syncfusion) y useNotificaciones
│   └── torneos/                    TarjetaTorneo
├── config/entorno.ts               URL de la API leída de VITE_API_URL
├── estilos/syncfusion.css          Estilos del tema, solo de los componentes que se usan
├── modelos/                        Tipos del dominio: torneo, equipo, inscripción, posiciones, fixture, estados
├── paginas/                        InicioPagina, EnConstruccionPagina, NoEncontradaPagina
├── servicios/                      Un servicio por recurso de la API
├── App.tsx                         Proveedores globales (TanStack Query, notificaciones) y router
├── index.css                       Estilos globales y breakpoints
├── main.tsx                        Licencia de Syncfusion, estilos y montaje de la app
├── rutas.tsx                       Definición de las rutas
└── vite-env.d.ts                   Tipos de las variables VITE_
```

Comparado con tu MVVM en Blazor: `modelos/` son los Models, `servicios/` son los servicios que llaman a la API, y la lógica de cada pantalla (lo que haría el ViewModel) va en la propia página o en un hook propio cuando crece.

### Conceptos

- **Componentes funcionales y props:** cada componente es una función que recibe un objeto de props y devuelve lo que se dibuja (JSX). Las props son los `[Parameter]` de Blazor, y una prop que es función (como `onNavegar` en `MenuNavegacion` u `onReintentar` en `MensajeError`) es el `EventCallback`. **Son la "input property" y la "output property" que pide la cátedra.**
- **`useState`:** estado del componente (por ejemplo, `menuAbierto` en el Layout). Al cambiarlo con su función (`setMenuAbierto`), React vuelve a dibujar el componente, que es lo que en Blazor hace `StateHasChanged`. Es la "reactividad ante un estado" que pide la cátedra.
- **Contexto (`createContext` + `useContext`):** comparte algo con todos los componentes de abajo sin pasarlo por props. Se usa para las notificaciones: cualquier pantalla llama a `useNotificaciones()`, como un servicio inyectado con `@inject`.
- **Hooks:** funciones que empiezan con `use` y usan estado o contexto (`useState`, `useQuery`, `useNotificaciones`). Tienen una regla: se llaman siempre en el mismo orden, en el cuerpo del componente, nunca dentro de un `if`. El linter la controla.
- **`useQuery` (TanStack Query):** pide los datos con el servicio, los guarda en caché bajo una clave y expone `data`, `isPending` y `error`. Reemplaza el `OnInitializedAsync` + `IsBusy` + try/catch de un ViewModel. La clave (`['torneos']`) sirve para invalidar los datos después de guardar.
- **`signal` (cancelación):** TanStack Query pasa una señal a cada pedido y lo cancela si el componente se desmonta. Es el `CancellationToken` de .NET.
- **Rutas anidadas y `<Outlet />`:** todas las rutas se dibujan dentro del `Layout`, en el lugar del `<Outlet />`. Equivale a `@Body` en el `MainLayout.razor`. `NavLink` marca la opción del menú de la pantalla actual.
- **"Enums" sin `enum`:** en el frontend no se puede usar `enum` (`erasableSyntaxOnly`). Se usa un objeto `as const` y un tipo con el mismo nombre:

  ```ts
  export const EstadoTorneo = { Inscripcion: 1, EnCurso: 2, Finalizado: 3 } as const;
  export type EstadoTorneo = (typeof EstadoTorneo)[keyof typeof EstadoTorneo]; // 1 | 2 | 3
  ```

  Se usa igual que un enum (`EstadoTorneo.EnCurso`), y el tipo solo admite los valores válidos.
- **Fechas:** la API devuelve las fechas en UTC como texto ISO 8601 (`"2026-10-10T18:00:00.000Z"`). En los tipos quedan como `string` y se convierten a hora local al mostrarlas.

### Manejo de errores de la API

El cliente (`cliente-api.ts`) centraliza los pedidos:

| Situación | Qué hace |
|:--|:--|
| Respuesta 2xx | Devuelve el JSON convertido al tipo pedido. Con 204 (borrados), no devuelve nada |
| Respuesta 4xx o 5xx | Lanza un `ErrorApi` con el `mensaje` y los `detalles` por campo que arma el backend |
| Servidor caído o sin conexión | Lanza un `ErrorApi` con estado 0 y "No se pudo conectar con el servidor…" |
| Pedido cancelado | Lo deja pasar sin convertirlo en error |

Configuración de TanStack Query (`App.tsx`):
- **Datos frescos por 30 segundos:** en ese tiempo no se vuelven a pedir.
- **Errores 4xx:** no se reintentan (repetir el pedido daría lo mismo).
- **Errores de conexión o 5xx:** se reintentan hasta 2 veces.

> **Reintentos y pestaña oculta:** TanStack Query pausa los reintentos mientras la página no está visible y los retoma al volver. Con la página visible, un error de conexión se muestra a los pocos segundos (después de los dos reintentos) con el botón "Reintentar".

Para avisar éxitos y errores de las operaciones (guardar, borrar) está `useNotificaciones()`, con un `ToastComponent` de Syncfusion abajo al centro.

### Layout mobile-first y breakpoints

Los estilos base son para celular, y las media queries agregan lo de pantallas más grandes:

| Breakpoint | Ancho | Menú | Tarjetas |
|:--|:--|:--|:--|
| SM | hasta 767 px | Oculto. Se abre con el botón ☰ sobre un fondo oscuro y se cierra al elegir una opción o tocar el fondo | 1 columna |
| MD | 768 a 991 px | Igual que SM | 2 columnas |
| LG | desde 992 px | Fijo a la izquierda; desaparece el botón ☰ | 3 columnas |

La barra superior es el `AppBarComponent` de Syncfusion. Los colores propios (menú, errores, tarjetas) usan las variables del tema (`rgb(var(--color-sf-primary))`), así todo se ve igual que los componentes de Syncfusion.

### Estilos de Syncfusion: solo lo que se usa

El tema completo (`material3.css`) trae los estilos de todos los componentes de Syncfusion y pesaba **4,8 MB**. `src/estilos/syncfusion.css` importa solo los de los componentes que usa la aplicación (base, botones, inputs, desplegables, calendarios, diálogos, avisos, barra, grilla, tarjetas y badges): el CSS bajó a **1,8 MB (223 KB comprimido)**. **Al usar un componente nuevo de Syncfusion, hay que agregar su carpeta de estilos en ese archivo.**

### Rutas

| Ruta | Pantalla |
|:--|:--|
| `/` | Inicio: tarjetas de los torneos con su estado y accesos a posiciones y fixture |
| `/torneos`, `/equipos` | En construcción (etapa 4) |
| `/posiciones` | En construcción (etapa 6) |
| `/fixture` | En construcción (etapa 7) |
| cualquier otra | Página no encontrada |

### Archivos modificados

| Archivo | Cambio |
|:--|:--|
| `src/main.tsx` | Registra la licencia de Syncfusion (`registerLicense`) e importa los estilos |
| `src/App.tsx` | Reemplazado: proveedores de TanStack Query y notificaciones, y el router |
| `src/index.css` | Reemplazado: estilos globales con las variables del tema y los breakpoints |
| `index.html` | Idioma `es`, título "LigaHub" y descripción |
| `src/App.css`, `src/assets/`, `public/icons.svg` | Borrados (eran de la pantalla de ejemplo) |

### Cómo probarlo

Con el backend levantado (`pnpm start:dev` en LigaHub-BE, con el seed cargado):

```powershell
pnpm dev
```

En `http://localhost:5173` se ven las tarjetas de Apertura (en curso) y Clausura (inscripción abierta). Para ver los breakpoints, en las herramientas de desarrollo del navegador (F12) usar el modo dispositivo y probar 375, 800 y 1280 px de ancho.

Se verificó en el navegador:
- **Los tres breakpoints:** menú fijo en LG y desplegable en MD y SM; 1, 2 o 3 columnas según el ancho.
- **El menú en SM:** se abre, marca la opción activa y se cierra al navegar.
- **La página de ruta inexistente.**
- **El registro de la licencia:** sin aviso con la clave válida; con una clave inválida aparece el aviso de Syncfusion.

## Etapa 4 — Pantallas CRUD: Torneo y Equipo

**Estado:** Pendiente

- Patrón grilla + modal, como en tu trabajo: `GridComponent` y `DialogComponent` de Syncfusion para el listado, alta, edición y baja, refrescando la grilla después de cada operación exitosa.
- Componentes propios reutilizables sobre los de Syncfusion (formulario, tabla, modal de confirmación).

## Etapa 5 — Pantalla CRUD dependiente: Inscripción de equipo

**Estado:** Pendiente

- Alta de inscripción eligiendo torneo y equipo.
- Mostrar el error del backend si el equipo ya está inscripto.

## Etapa 6 — Listado con filtro y detalle

**Estado:** Pendiente

- Tabla de posiciones con filtro por torneo.
- Al seleccionar un equipo, pedido al backend y pantalla de detalle con datos de al menos dos clases de negocio.

## Etapa 7 — Caso de uso: generar el fixture

**Estado:** Pendiente

- Botón para generar el fixture de un torneo y vista de las fechas y partidos generados.

## Etapa 8 — Revisión de requisitos de la cátedra

**Estado:** Pendiente

Checklist que se verifica en la defensa, componente por componente:

- [ ] Manejo de eventos del usuario (click, input)
- [ ] Manejo amigable de errores
- [ ] Reactividad ante un cambio de estado
- [ ] Input property (en React, una prop; en Blazor, `[Parameter]`)
- [ ] Output property (en React, una función recibida por prop; en Blazor, `EventCallback`)
- [ ] Al menos un servicio
- [ ] Modelos representados con clases, interfaces o tipos
- [ ] Visualización correcta en SM, MD y LG
- [ ] Que no haga falta un manual de usuario

## Etapa 9 — Documentación y proposal

**Estado:** Pendiente

- Actualizar `proposal.md`:
  - Integrantes: quedan dos (figuran cuatro).
  - Alcance recortado a lo exigido para dos integrantes.
  - Partido no es un CRUD simple (referencia a otras clases).
  - "Listado de equipos por puntos" no tiene filtro: reformularlo como tabla de posiciones filtrada por torneo.
  - Especificar qué muestra cada detalle.
  - Reemplazar el link de prnt.sc del modelo por el diagrama versionado.
  - Declarar React como tecnología no vista en el cursado.
- `docs/README.md` como entrada, enlazado desde el README principal.

## Etapa 10 — Aprobación directa: login, rutas protegidas, tests y ambientes

**Estado:** Pendiente

- Login y protección de rutas según los roles del backend (Administrador, Asistente, Jugador). El token JWT se guarda en memoria y en `sessionStorage` y se envía en el encabezado `Authorization` desde el servicio de API. Sin tokens de refresco por ahora. Diseño completo en [LigaHub-BE/docs/seguridad.md](https://github.com/mateorindello1/LigaHub-BE/blob/main/docs/seguridad.md).
- Un test unitario de componente y un test end-to-end.
- Ambientes definidos (`.env`).
