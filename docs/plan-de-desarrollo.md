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
| 4 | [Pantallas CRUD: Torneo y Equipo](#etapa-4--pantallas-crud-torneo-y-equipo) | Hecha |
| 5 | [Pantalla CRUD dependiente: Inscripción de equipo](#etapa-5--pantalla-crud-dependiente-inscripción-de-equipo) | Hecha |
| 6 | [Listado con filtro y detalle](#etapa-6--listado-con-filtro-y-detalle) | Hecha |
| 7 | [Caso de uso: generar el fixture](#etapa-7--caso-de-uso-generar-el-fixture) | Hecha |
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

**Estado:** Hecha (2026-10-09)

**Objetivo:** los dos CRUD simples con el patrón de tu trabajo: grilla + ventana modal, recargando la grilla después de cada operación exitosa. Los componentes comunes (diálogo, confirmación, campos, botones de fila) quedan listos para reutilizar en las etapas siguientes.

### Archivos nuevos

```
src/
├── componentes/
│   ├── comunes/
│   │   ├── AccionesFila.tsx            Botones modificar y borrar de cada fila
│   │   ├── Dialogo.tsx                 DialogComponent de Syncfusion con la configuración común
│   │   └── DialogoConfirmacion.tsx     "¿Borrar…? No se puede deshacer." con Cancelar / Borrar
│   ├── equipos/
│   │   ├── EscudoEquipo.tsx            Imagen del escudo, o círculo con iniciales si no tiene
│   │   └── FormularioEquipo.tsx        Alta y modificación, con vista previa del escudo
│   ├── formularios/
│   │   ├── BotonesFormulario.tsx       Pie con Cancelar y Guardar ("Guardando…" mientras espera)
│   │   ├── CampoNumero.tsx             NumericTextBox de Syncfusion conectado a React Hook Form
│   │   ├── CampoTexto.tsx              TextBox de Syncfusion conectado a React Hook Form
│   │   ├── MensajeCampo.tsx            Error o ayuda debajo de un campo
│   │   └── errores-servidor.ts         Muestra en el formulario los errores que devuelve la API
│   └── torneos/
│       ├── BadgeEstadoTorneo.tsx       Estado del torneo como badge de color
│       └── FormularioTorneo.tsx        Alta y modificación
├── config/textos-syncfusion.ts         Textos de la grilla, el paginador y el diálogo en español
├── hooks/
│   ├── equipos.hooks.ts                useEquipos, useCrearEquipo, useModificarEquipo, useBorrarEquipo
│   └── torneos.hooks.ts                useTorneos, useCrearTorneo, useModificarTorneo, useBorrarTorneo
├── paginas/
│   ├── EquiposPagina.tsx               ABM de equipos
│   └── TorneosPagina.tsx               ABM de torneos
└── validaciones/
    ├── equipo.validacion.ts            Esquema Zod del formulario de equipo
    └── torneo.validacion.ts            Esquema Zod del formulario de torneo
```

### Cómo se reparte el trabajo (comparado con tu MVVM)

| Pieza | Qué hace | En tu MVVM de Blazor |
|:--|:--|:--|
| `TorneosPagina` | Grilla, botón "Nuevo", qué diálogo está abierto y los avisos | La vista `.razor` con su code-behind |
| `useTorneos` | Trae la lista y la mantiene en caché | El ViewModel de listado con su colección |
| `useCrearTorneo`, `useModificarTorneo`, `useBorrarTorneo` | Llaman al servicio y, si sale bien, invalidan la caché para que la grilla se recargue | `CreateCommand`, `UpdateCommand`, `DeleteCommand` del ViewModel de CRUD |
| `FormularioTorneo` | Valores, validación y envío del formulario | El componente de formulario con `EditForm` |
| `esquemaTorneo` (Zod) | Reglas de validación | El validador de FluentValidation o los DataAnnotations del Model |
| `torneosServicio` (etapa 3) | Los pedidos HTTP | El servicio con `HttpClient` |

### Flujo de una operación

Al guardar un torneo:

1. `handleSubmit` de React Hook Form valida con el esquema de Zod. Si algo falla, muestra el error debajo del campo y no envía nada.
2. Si los datos son válidos, `FormularioTorneo` llama a `onGuardar` (la output property) y espera. Mientras tanto, `isSubmitting` deshabilita los botones y Guardar dice "Guardando…".
3. La página llama a `mutateAsync` del hook, que usa el servicio.
4. **Si sale bien:** el hook invalida la clave `['torneos']`, TanStack Query vuelve a pedir la lista y la grilla se actualiza sola. La página muestra el aviso de éxito y cierra el diálogo.
5. **Si falla:** la promesa se rechaza, el formulario captura el error y lo muestra (ver la tabla siguiente). El diálogo queda abierto para corregir.

El borrado es parecido: la confirmación llama a `mutate` y el resultado (éxito o error) se avisa con una notificación.

### Errores en los formularios

| Error | Dónde se ve | Ejemplo |
|:--|:--|:--|
| Validación de Zod (antes de enviar) | Debajo del campo, en rojo | "El año no puede ser anterior a 2000." |
| 400 de validación del backend, con `detalles` | Debajo del campo correspondiente | El backend rechaza la URL del escudo |
| Otro error del backend (409, 404, conexión) | Recuadro de error dentro del diálogo | "Ya existe un equipo llamado "Los Halcones"." |
| Error al borrar | Notificación roja | "No se puede borrar un torneo con equipos inscriptos o fixture generado." |

Los esquemas de Zod repiten las reglas y los mensajes de los DTO del backend. Así el usuario ve el error sin esperar la respuesta, y el backend sigue validando igual. La unicidad del nombre del equipo solo la puede validar el backend.

### Conceptos

- **React Hook Form:** `useForm` administra los valores, los errores y el envío; `zodResolver` le pasa el esquema de Zod para validar. Es el `EditForm` con `FluentValidationValidator` de Blazor. Los campos no vuelven a dibujar todo el formulario en cada tecla.
- **`useController`:** conecta un componente que no es un `<input>` común (el `TextBoxComponent` o el `NumericTextBoxComponent` de Syncfusion) con el formulario. Equivale al `@bind-Value` de un componente de Syncfusion dentro de un `EditForm`.
- **Componentes genéricos:** `CampoTexto<T>` recibe el control del formulario y el nombre del campo. TypeScript solo acepta nombres que existen en el formulario, como una expresión `x => x.Nombre`.
- **`z.infer`:** el tipo de los datos del formulario se deduce del esquema, así no se escribe dos veces.
- **`useMutation`:** representa una operación que modifica datos. `mutateAsync` devuelve una promesa (se usa en el formulario, que necesita saber si falló); `mutate` avisa por callbacks (`onSuccess`, `onError`). `isPending` indica que está en curso.
- **Invalidación de la caché:** `invalidateQueries({ queryKey: ['torneos'] })` marca los datos como viejos y los vuelve a pedir. Como las claves son jerárquicas, también se actualizan las posiciones y el fixture que cuelgan de `['torneos', id, …]`. Al guardar un equipo se invalidan `['equipos']` y `['torneos']`, porque su nombre aparece en las posiciones.
- **Plantillas de columna:** la grilla recibe una función que dibuja la celda (`template={plantillaAcciones}`), como el `<Template>` de una `GridColumn`. Se envuelve en `useCallback` para que sea la misma función en cada dibujo; si cambiara, la grilla redibujaría las columnas.
- **Diálogo que se monta y desmonta:** el diálogo se dibuja solo mientras está abierto (`{edicion && <Dialogo …>}`). Cada vez que se abre, el formulario arranca de cero con los datos del registro, sin tener que limpiarlo a mano.
- **Estado de la pantalla:** `edicion` dice qué formulario está abierto (`null`, alta o modificación de un registro) y `aBorrar` qué registro se está por borrar. Las dos son `useState`.

### Detalles de Syncfusion que aparecieron

- **El diálogo tiene que dibujarse dentro de `#root`.** Syncfusion mueve el diálogo al `<body>`, fuera del contenedor de React. React escucha los eventos solo dentro de su raíz, así que el `onSubmit` del formulario no llegaba y el navegador hacía un envío común (recargaba la página con `?anio=2026` en la URL). Se resolvió con `target="#root"` en `Dialogo.tsx`, y en `index.css` el contenedor queda `position: fixed` para centrarse en la pantalla.
- **El NumericTextBox le pone a su etiqueta un ancho fijo calculado,** que podía superar el del diálogo. Al llevar el foco al campo con error, el contenido se desplazaba hacia el costado. Se limitó con `max-width: 100%` en `index.css`.
- **El NumericTextBox avisa el cambio al salir del campo o con Enter,** no en cada tecla (no tiene evento `input`). Se verificó que tocar Guardar sin salir del campo toma igual el valor nuevo.
- **Los límites del año (2000 a 2100) los valida Zod y no el control.** El NumericTextBox puede corregir el valor solo (`min` y `max`), pero así el usuario no sabe por qué cambió.
- **Textos en español:** `config/textos-syncfusion.ts` carga con `L10n.load` las traducciones del paginador, la grilla vacía y el botón de cerrar del diálogo, y los componentes las usan con `locale="es"`. No se cargó la cultura completa (números y fechas), que requiere los datos CLDR.
- **Columnas según el ancho:** `hideAtMedia` muestra una columna solo cuando se cumple la media query. En celular, la grilla de torneos oculta Año y Estado, y el estado se muestra debajo del nombre.

### Otros cambios

| Archivo | Cambio |
|:--|:--|
| `src/rutas.tsx` | `/torneos` y `/equipos` apuntan a las pantallas nuevas |
| `src/main.tsx` | Importa los textos en español de Syncfusion |
| `src/paginas/InicioPagina.tsx` | Usa `useTorneos` en lugar de `useQuery` directo: comparte la caché con la grilla |
| `src/componentes/torneos/TarjetaTorneo.tsx` | Usa `BadgeEstadoTorneo` |
| `src/api/error-api.ts` | `mensajeDeError` también acepta un texto |
| `src/index.css` | Estilos de campos, diálogos, celdas y escudos |

### Cómo probarlo

Con el backend levantado y el seed cargado, `pnpm dev` y entrar a **Torneos** o **Equipos** desde el menú.

Se verificó en el navegador:
- **Alta de torneo:**
  - Con el formulario vacío y el año en 1999 aparecen los dos errores de Zod.
  - Con datos válidos, enviado con Enter desde el año, se crea, la grilla se actualiza y aparece el aviso.
- **Modificación:** el formulario se abre con los datos del registro y guarda el cambio.
- **Baja rechazada:** borrar Apertura muestra el error del backend en una notificación ("No se puede borrar un torneo con equipos inscriptos o fixture generado.").
- **Baja correcta** de un torneo y un equipo creados para la prueba.
- **Equipo:**
  - Una URL inválida se marca en el campo.
  - El nombre repetido muestra el 409 dentro del diálogo.
  - La vista previa del escudo muestra la imagen o las iniciales.
- **Error del backend en su campo:** el backend rechazó `http://localhost:5173/…` como escudo. Su `@IsUrl` exige un dominio con extensión, así que el esquema de Zod se ajustó para aplicar la misma regla.
- **Escape** cierra el diálogo.
- **Breakpoints:**
  - **LG (1280 px) y MD (800 px):** grilla completa.
  - **SM (375 px):** nombre con el estado debajo, y diálogos con margen a los costados.

> **Tamaño del JavaScript:** el paquete pesa 1,96 MB (496 KB comprimido), sobre todo por la grilla de Syncfusion, y Vite avisa que supera los 500 KB. No impide nada. Si hace falta, en la etapa 8 se puede cargar cada pantalla por separado (rutas con `lazy`).

## Etapa 5 — Pantalla CRUD dependiente: Inscripción de equipo

**Estado:** Hecha (2026-10-10)

**Objetivo:** el CRUD dependiente que pide la cátedra. Una inscripción depende de un torneo (y de un equipo): primero se elige el torneo y después se inscriben, cambian o dan de baja equipos en él.

### La pantalla

`/inscripciones?torneo=2`, en el menú como **Inscripciones** y en cada tarjeta del inicio.

- **Selector de torneo** arriba, con el estado del torneo elegido. Si la URL no trae torneo, se elige el primero con las inscripciones abiertas.
- **Grilla** con los equipos inscriptos y la cantidad.
- **Inscribir equipo:** diálogo con una lista desplegable que muestra solo los equipos que todavía no están inscriptos.
- **Modificar** (lápiz): cambia el equipo de la inscripción. La lista incluye el equipo actual, que aparece elegido.
- **Borrar** (tacho): da de baja la inscripción, con confirmación.
- **Torneo en curso o finalizado:** aviso "Las inscripciones de este torneo están cerradas", botón deshabilitado y grilla sin columna de acciones. El backend también lo controla (responde 409).

### Archivos nuevos

| Archivo | Qué es |
|:--|:--|
| `src/paginas/InscripcionesPagina.tsx` | La pantalla |
| `src/componentes/inscripciones/FormularioInscripcion.tsx` | Formulario de alta y cambio de equipo |
| `src/componentes/formularios/CampoLista.tsx` | DropDownList de Syncfusion conectado a React Hook Form |
| `src/componentes/torneos/SelectorTorneo.tsx` | Filtro por torneo; se reutiliza en posiciones y fixture |
| `src/hooks/torneo-seleccionado.hook.ts` | Lee y cambia el torneo elegido en la URL |
| `src/hooks/inscripciones-equipo.hooks.ts` | Consulta y operaciones de inscripciones |
| `src/validaciones/inscripcion-equipo.validacion.ts` | Esquema Zod: hay que elegir un equipo |

### Archivos modificados

| Archivo | Cambio |
|:--|:--|
| `src/rutas.tsx` | Ruta `/inscripciones` |
| `src/componentes/layout/Layout.tsx` | Opción Inscripciones en el menú (ícono `e-checklist`) |
| `src/componentes/torneos/TarjetaTorneo.tsx` | Acceso a las inscripciones del torneo |
| `src/paginas/InicioPagina.tsx` | Descripción actualizada |
| `src/config/textos-syncfusion.ts` | Textos de la lista desplegable ("No hay opciones para elegir.") |
| `src/index.css` | Estilos del selector, el aviso y el resumen |

### Conceptos

- **Ruta anidada en el backend, filtro en el frontend:** la API es `/torneos/:torneoId/inscripciones`, y la pantalla trabaja siempre sobre un torneo elegido. Los hooks reciben el `torneoId` y lo pasan al servicio.
- **Estado en la URL (`useSearchParams`):** el torneo elegido vive en `?torneo=2` y no en un `useState`. Así el enlace se puede compartir, Atrás funciona y las tarjetas del inicio abren la pantalla con el torneo ya elegido. Equivale a un `[SupplyParameterFromQuery]` de Blazor. Se cambia con `replace: true` para no llenar el historial con cada cambio de filtro.
- **Valor deducido en lugar de sincronizado:** `useTorneoSeleccionado` no guarda estado: en cada dibujo calcula el torneo a partir de la URL y la lista. No hace falta un `useEffect` para "poner el torneo por defecto".
- **Consulta en espera (`skipToken`):** mientras no hay torneo, `useInscripciones` no pide nada. Se usa `isLoading` (pidiendo por primera vez) en lugar de `isPending` (sin datos todavía), que en espera sería siempre verdadero.
- **Reglas de los hooks:** los hooks no se pueden llamar dentro de un `if`. Por eso las operaciones se crean siempre, con `torneoId ?? 0`, y los botones que las usan solo se muestran si hay torneo.
- **Invalidación por torneo:** después de inscribir, cambiar o dar de baja se invalida `['torneos', torneoId]`. Se recargan las inscripciones y también las posiciones, el detalle y el fixture de ese torneo.
- **`key` para recrear la grilla:** la grilla tiene `key={torneo.id + abiertas}`. Al cambiar de torneo, React la crea de nuevo con las columnas que correspondan; Syncfusion no siempre refleja que se agregue o quite una columna en una grilla ya creada.
- **Selector como input/output property:** `SelectorTorneo` recibe `valor` y avisa `onCambiar`, sin estado propio. Es el patrón `Value` / `ValueChanged` de un componente de Blazor.

### Syncfusion: objetos en las props

Al principio, elegir una opción de la lista desplegable a veces no quedaba tomado: la lista seguía abierta o volvía al valor anterior.

La causa: `CampoLista` pasaba `fields={{ text, value }}` y `htmlAttributes={{ … }}` escritos dentro del JSX, que crean **un objeto nuevo en cada dibujo**. Al elegir una opción, el formulario se vuelve a dibujar; Syncfusion recibe objetos "distintos" (aunque tengan lo mismo), lo toma como un cambio de configuración y recarga la lista en medio de la selección.

La solución fue pasar siempre el mismo objeto mientras no cambien los datos:
- Con `useMemo` dentro del componente (`campos`, `atributos` en `CampoLista`).
- Con una constante fuera del componente cuando no depende de nada (`CAMPOS` en `SelectorTorneo`).
- Con `useMemo` para la lista de equipos disponibles en la página.

**Regla para los componentes de Syncfusion:** no escribir objetos ni arreglos en las props dentro del JSX si el componente se puede volver a dibujar mientras el usuario interactúa. En Blazor no pasa porque los parámetros solo se aplican si cambian.

### Cómo probarlo

Con el backend levantado y el seed cargado, `pnpm dev` y entrar a **Inscripciones**, o a **Inscripciones** en la tarjeta de un torneo.

Se verificó en el navegador:
- **Cambio de torneo:** el selector actualiza la URL y la grilla.
- **Torneo cerrado:** con Apertura (en curso), entrando desde su tarjeta, aparecen el aviso, el botón deshabilitado y la grilla sin acciones. Al volver a Clausura reaparece la columna.
- **Alta:**
  - Enviar sin elegir muestra "Elegí un equipo.".
  - La lista muestra solo los equipos no inscriptos.
  - Al inscribir, la grilla y la cantidad se actualizan y aparece el aviso.
- **Cambio de equipo:** la lista se abre con el equipo actual elegido y guarda el cambio.
- **Baja** con confirmación.
- **Celular (375 px):** selector, grilla y diálogo. En celular, Syncfusion muestra la lista desplegable a todo el ancho.

Las inscripciones de prueba se dieron de baja: Clausura quedó con sus 4 equipos del seed.

## Etapa 6 — Listado con filtro y detalle

**Estado:** Hecha (2026-10-10)

**Objetivo:** el "listado con filtro + detalle" que pide la cátedra. El listado es la tabla de posiciones filtrada por torneo. Al elegir un equipo, se hace un pedido al backend y se muestra su detalle, con datos de varias clases de negocio: Torneo, Equipo, Partido y Jugador.

### Las pantallas

**Posiciones** (`/posiciones?torneo=1`):
- Usa el mismo selector de torneo que Inscripciones. Por defecto elige el primer torneo en curso.
- La tabla trae, en orden: #, Equipo, PJ, G, E, P, GF, GC, DG y Pts. Debajo hay una referencia de las abreviaturas y del criterio de desempate.
- El nombre de cada equipo es un enlace a su detalle.
- En celular solo se ven #, Equipo, PJ, DG y Pts.

**Detalle del equipo** (`/posiciones/:torneoId/equipos/:equipoId`):
- **Encabezado:** escudo, nombre, torneo y estado del torneo.
- **Cifras:** posición, puntos, jugados, ganados, empatados, perdidos, goles a favor, goles en contra y diferencia, como tarjetas (3 por fila en celular, 5 en MD, 9 en LG).
- **Partidos:** fecha, rival (L/V), resultado ("G 3 - 1", "W.O." o el estado si no se jugó), día y hora local y cancha. En celular se ocultan día y hora y cancha; en MD, la cancha.
- **Jugadores:** número, apellido y nombre, y la marca del capitán.
- **"Volver a la tabla":** vuelve a las posiciones del mismo torneo.
- **Errores:**
  - Si el equipo no está inscripto en el torneo, se muestra el 404 del backend, sin botón de reintentar.
  - Si la URL tiene ids que no son números, aparece la página de "no encontrada".

La ruta del detalle cuelga de `/posiciones` (y no de `/torneos`) para que el menú marque **Posiciones** mientras se ve un equipo.

### Archivos

| Archivo | Qué es |
|:--|:--|
| `src/paginas/PosicionesPagina.tsx` | Tabla de posiciones con el filtro por torneo |
| `src/paginas/DetalleEquipoPagina.tsx` | Detalle del equipo en el torneo |
| `src/componentes/posiciones/CifrasEquipo.tsx` | Tarjetas con las cifras del equipo |
| `src/componentes/posiciones/ResultadoPartido.tsx` | Resultado con badge G/E/P, W.O. o estado del partido |
| `src/hooks/posiciones.hooks.ts` | `usePosiciones` y `useDetalleEquipo` (solo consultas) |
| `src/utilidades/formato.ts` | Fecha y hora local, diferencia de gol con signo |
| `src/rutas.tsx` | Rutas `/posiciones` y `/posiciones/:torneoId/equipos/:equipoId` |
| `src/index.css` | Estilos de cifras, detalle, enlaces y grillas compactas |

### Conceptos

- **Parámetros de ruta (`useParams`):** el detalle lee `torneoId` y `equipoId` de la URL. Equivale a `@page "/posiciones/{TorneoId:int}/equipos/{EquipoId:int}"` con sus `[Parameter]`. React Router no tipa ni valida los parámetros: llegan como texto y se convierten y validan a mano.
- **Hooks y `return` anticipado:** un hook no se puede llamar después de un `return` condicional. Por eso `DetalleEquipoPagina` valida los ids y, si están bien, dibuja un componente interno (`DetalleEquipo`) que es el que usa `useDetalleEquipo`.
- **Datos calculados, sin mutaciones:** las posiciones se calculan en el backend a partir de los partidos. Esta pantalla solo consulta. Cuando se carguen resultados o se genere el fixture (etapa 7), basta con invalidar `['torneos', id]` para que la tabla y el detalle se actualicen.
- **Fechas en hora local:** la API manda UTC (`"2026-09-19T20:00:00.000Z"`) y `Intl.DateTimeFormat('es-AR', …)` la muestra en la hora del navegador con formato de 24 h ("sáb, 19 sept, 17:00"). Es el `ToLocalTime().ToString(...)` de .NET.
- **Enlaces dentro de la grilla:** la plantilla de la columna Equipo devuelve un `<Link>` de React Router. Para que la plantilla no dependa del torneo elegido (y la grilla no la vuelva a crear), cada fila lleva su `torneoId`, agregado con `useMemo`.

### Grillas en pantallas chicas

La tabla de posiciones tiene 10 columnas y en celular no entra.
- **Columnas según el ancho:** con `hideAtMedia` se ocultan G, E, P, GF y GC por debajo de MD.
- **Relleno de las celdas:** Syncfusion les pone 12 px a cada lado y en una columna de 48 px los títulos se cortaban ("P.", "D."). La clase `tabla-compacta` lo baja a 4 px en SM y MD.
  - Hubo que superar selectores de Syncfusion muy específicos, como `.e-grid.e-device .e-headercell:first-child`.
  - Se resolvió repitiendo la clase: `.e-grid.tabla-compacta.tabla-compacta .e-headercell`.
- **Nombres largos:** las celdas de la grilla no cortan líneas. Los nombres de equipo y de rival pueden ocupar dos líneas con `white-space: normal` y un interlineado más chico.

> **Vite y escrituras rápidas:** al modificar `index.css` varias veces en el mismo segundo, Vite se quedó con una versión intermedia y el navegador seguía viendo la regla vieja. Se resolvió guardando el archivo de nuevo. Si un cambio de CSS no aparece, conviene volver a guardar el archivo o reiniciar `pnpm dev`.

### Cómo probarlo

Con el backend levantado y el seed cargado, `pnpm dev` y entrar a **Posiciones**, o a **Posiciones** en la tarjeta de un torneo.

Se verificó en el navegador:
- **Torneo por defecto:** la tabla abre con Apertura (en curso). Las cifras coinciden con los partidos del seed; por ejemplo, Atlético Norte: 2 ganados y 1 empatado, 7 puntos, 9-3, +6.
- **Clausura** (sin fixture): todos los equipos con 0.
- **Detalle de Atlético Norte y de Estrella Roja:**
  - Las cifras coinciden con su fila de la tabla.
  - Partidos ganados, empatados, por W.O., suspendidos y programados.
  - Jugadores con capitán.
- **Volver a la tabla** mantiene el torneo.
- **Errores:** `/posiciones/2/equipos/1` (equipo no inscripto) muestra el mensaje del backend, y `/posiciones/abc/equipos/1`, la página de "no encontrada".
- **Breakpoints:** 1280, 800 y 375 px, tanto en la tabla como en el detalle.

## Etapa 7 — Caso de uso: generar el fixture

**Estado:** Hecha (2026-10-10)

**Objetivo:** el caso de uso que pide la cátedra para regularidad. Con los equipos inscriptos, el sistema arma todas las fechas "todos contra todos", las guarda y pasa el torneo a En curso.

### La pantalla

`/fixture?torneo=2`, en el menú como **Fixture** y en cada tarjeta del inicio. Por defecto abre el primer torneo en curso.

**Torneo en inscripción y sin fixture:**
- Aviso con la cantidad de equipos inscriptos.
- Botón **Generar fixture**, deshabilitado si hay menos de 2 equipos. En ese caso el aviso dice cuántos faltan y enlaza a Inscripciones.
- El diálogo de generación tiene:
  - **Ida y vuelta** (casilla): dos ruedas, con la localía invertida en la segunda.
  - **Primera fecha** (fecha y hora, opcional): las siguientes se programan una semana después. Sin fecha, los partidos quedan "a confirmar".
  - **Resumen calculado mientras se elige:** "Con 4 equipos se van a crear 6 fechas de 2 partidos (12 en total)". Avisa si en cada fecha queda un equipo libre y que el torneo pasa a En curso.
- Al generar:
  - El torneo pasa a En curso y aparece el fixture.
  - Se avisa cuántas fechas se crearon.
  - El torneo queda fijo en la URL, porque al cambiar de estado el torneo por defecto podría ser otro.

**Torneo con fixture:**
- Una tarjeta por fecha (1 columna en celular, 2 desde MD).
- Cada partido muestra local, marcador (o "vs") y visitante; debajo, día y hora local y cancha, y un badge si fue W.O. o se suspendió.
- Si la cantidad de equipos es impar, la tarjeta indica el equipo libre de la fecha.
- Botón **Deshacer fixture**, con confirmación: borra las fechas y vuelve el torneo a inscripción. El backend lo rechaza si ya hay partidos jugados o suspendidos, y el motivo se muestra en una notificación.

### Archivos nuevos

| Archivo | Qué es |
|:--|:--|
| `src/paginas/FixturePagina.tsx` | La pantalla del caso de uso |
| `src/componentes/fixture/FormularioGenerarFixture.tsx` | Opciones de generación con el resumen |
| `src/componentes/fixture/TarjetaFecha.tsx` | Una fecha con sus partidos y el equipo libre |
| `src/componentes/formularios/CampoCasilla.tsx` | CheckBox de Syncfusion conectado a React Hook Form |
| `src/componentes/formularios/CampoFechaHora.tsx` | DateTimePicker de Syncfusion conectado a React Hook Form |
| `src/hooks/fixture.hooks.ts` | `useFixture`, `useGenerarFixture`, `useDeshacerFixture` |
| `src/utilidades/resumen-fixture.ts` | Cantidad de fechas y partidos, con la misma regla que el backend |
| `src/validaciones/generar-fixture.validacion.ts` | Esquema Zod: la primera fecha, si se elige, tiene que ser futura |

### Archivos modificados

| Archivo | Cambio |
|:--|:--|
| `src/rutas.tsx` | `/fixture` apunta a la pantalla nueva |
| `src/paginas/EnConstruccionPagina.tsx` | Borrado: ya no quedan pantallas en construcción |
| `src/config/textos-syncfusion.ts` | Carga la cultura española (CLDR) y los textos del calendario |
| `src/componentes/formularios/BotonesFormulario.tsx` | Textos del botón configurables (`textoGuardar`, `textoProcesando`): en este caso de uso dice "Generar" |
| `src/index.css` | Estilos del aviso, el resumen y las tarjetas de fechas |
| `tsconfig.app.json` | `resolveJsonModule: true`, para importar los JSON de CLDR |
| `package.json` | Dependencias nuevas (ver abajo) |

### Dependencias nuevas

```powershell
pnpm add "@syncfusion/ej2-react-calendars@^35.1.37"
pnpm add cldr-core cldr-dates-full cldr-numbers-full
```

| Paquete | Para qué |
|:--|:--|
| `@syncfusion/ej2-react-calendars` | El `DateTimePickerComponent` (selector de fecha y hora) |
| `cldr-core`, `cldr-dates-full`, `cldr-numbers-full` (48.2.0) | Datos de cultura del proyecto Unicode CLDR: nombres de meses y días, primer día de la semana, formatos |

**Por qué CLDR:** sin esos datos, Syncfusion solo conoce la cultura en inglés y el calendario mostraba "October", "Mo Tu We" y "Today". `config/textos-syncfusion.ts` carga con `loadCldr` los JSON en español, y con eso el calendario muestra "octubre de 2026", la semana empieza el lunes y el botón dice "Hoy".
- Es el equivalente de `CultureInfo("es")` en .NET, que ahí viene incluido.
- Se importan solo 5 archivos JSON y Vite empaqueta solo esos, no los paquetes completos.

El JavaScript pasó de 1,96 MB a 2,26 MB (562 KB comprimido) entre el calendario y los datos de cultura.

### Conceptos

- **Caso de uso del lado del cliente:** la regla de negocio (el método del círculo, guardar en una transacción, cambiar el estado del torneo) está en el backend. El frontend junta las opciones, muestra cuánto se va a crear y presenta el resultado. Es tu patrón de Command: el formulario arma el "comando" `{ idaYVuelta, fechaInicio }` y lo envía.
- **Valores derivados con `useWatch`:** el resumen se calcula en cada dibujo a partir de "ida y vuelta". No se guarda en un estado aparte: si cambia el campo, React vuelve a dibujar y el resumen cambia solo. Es la "reactividad ante un cambio de estado" que pide la cátedra.
- **Fechas al enviar:** el selector devuelve un `Date` en hora local. `toISOString()` lo convierte a UTC ("2026-10-17T18:00:00.000Z" para las 15:00 de Argentina), que es lo que guarda el backend. Al mostrarlo, `formatearFechaHora` lo vuelve a la hora local.
- **Invalidación amplia:** generar o deshacer el fixture cambia el estado del torneo. Por eso se invalida `['torneos']` completo: la lista de torneos (con su estado), las inscripciones (que se cierran), las posiciones y el fixture.
- **Mutación sin datos:** `useDeshacerFixture` no recibe nada (el torneo ya lo tiene el hook), así que se llama `deshacer.mutate(undefined, { onSuccess, onError })`.

### Cómo probarlo

Con el backend levantado y el seed cargado, `pnpm dev` y entrar a **Fixture**.

Se verificó en el navegador:
- **Apertura:**
  - Muestra las 5 fechas del seed con resultados, W.O. y suspendidos, y coinciden con el detalle de la etapa 6.
  - "Deshacer fixture" muestra el rechazo del backend: hay partidos jugados.
- **Clausura** (4 equipos):
  - Aviso y botón "Generar fixture".
  - En el diálogo, el resumen cambia de 3 fechas (6 partidos) a 6 fechas (12 partidos) al marcar ida y vuelta.
  - El calendario aparece en español.
  - Una primera fecha pasada (1/10) muestra el error de Zod.
- **Generación** con ida y vuelta desde el sábado 17/10 a las 15:00:
  - Crea 6 fechas semanales (17/10, 24/10, 31/10…).
  - La vuelta invierte la localía.
  - El torneo pasa a En curso.
- **Deshacer** en Clausura (sin partidos jugados) lo vuelve a inscripción, como estaba antes de la prueba.
- **Copa de la Liga 2027** (0 equipos): botón deshabilitado, con el aviso y el enlace a Inscripciones.
- **Celular (375 px):** tarjetas en una columna y botones del encabezado.

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
