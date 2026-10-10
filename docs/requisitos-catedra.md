# Requisitos de la cátedra — Frontend

Verificación de los requisitos de regularidad del frontend ([enunciado del TP](https://github.com/utnfrrodsw/tp)), con dónde se cumple cada uno en el código. Sirve como guía para la defensa: para cada punto hay un ejemplo concreto para mostrar.

Revisado el 2026-10-10.

## Resumen

| Requisito | Estado |
|:--|:-:|
| Framework de frontend y HTML5 | Cumple |
| CSS según una biblioteca de componentes | Cumple |
| Mobile-first, 3 breakpoints (SM, MD, LG) | Cumple |
| Buenas prácticas de UX/UI, sin manual de usuario | Cumple |
| Manejo de eventos del usuario (click, input) | Cumple |
| Manejo amigable de errores | Cumple |
| Reactividad ante un cambio de estado | Cumple |
| Input property | Cumple |
| Output property | Cumple |
| Al menos un servicio | Cumple (5) |
| Modelos con clases, interfaces y tipos | Cumple |
| Algún patrón de diseño orientado a objetos (opcional) | Cumple |
| Dependencias registradas | Cumple |

## Framework de frontend y HTML5

- **React 19 + TypeScript**, generado con Vite. Rutas con React Router ([src/rutas.tsx](../src/rutas.tsx)).
- **HTML5 semántico:**
  - Layout ([Layout.tsx](../src/componentes/layout/Layout.tsx)): `<header>` (la barra, que el `AppBarComponent` dibuja como `<header>`), `<aside>` con `<nav>` (el menú) y `<main>`.
  - Encabezados de pantalla: `<header>` con `<h1>` ([EncabezadoPagina.tsx](../src/componentes/comunes/EncabezadoPagina.tsx)).
  - Tarjetas: `<article>` ([TarjetaTorneo.tsx](../src/componentes/torneos/TarjetaTorneo.tsx), [TarjetaFecha.tsx](../src/componentes/fixture/TarjetaFecha.tsx)).
  - Secciones del detalle: `<section>` con `<h2>`.
  - Cifras del equipo: lista de definiciones `<dl>`, `<dt>`, `<dd>` ([CifrasEquipo.tsx](../src/componentes/posiciones/CifrasEquipo.tsx)).
  - Formularios: `<form>` con envío real (Enter envía).
- **Accesibilidad básica:**
  - `aria-label` en los botones de solo ícono ([AccionesFila.tsx](../src/componentes/comunes/AccionesFila.tsx)).
  - `aria-invalid` y `aria-describedby` en los campos con error ([CampoTexto.tsx](../src/componentes/formularios/CampoTexto.tsx)).
  - `role="alert"` en los errores y `role="status"` en los avisos.
  - `lang="es"` en [index.html](../index.html).

## CSS según una biblioteca de componentes

- **Syncfusion para React con el tema Material 3:**
  - Grilla, diálogos, campos de formulario, listas, calendario, barra, tarjetas, badges y avisos.
  - Los estilos se importan solo para los componentes que se usan ([src/estilos/syncfusion.css](../src/estilos/syncfusion.css)).
- **Estilos propios** ([src/index.css](../src/index.css), [Layout.css](../src/componentes/layout/Layout.css)): usan las variables de color del tema (`rgb(var(--color-sf-primary))`), así lo propio se ve igual que los componentes de la biblioteca.
- **Estilo de código:**
  - Lint con **oxlint** y formato con **Prettier** (`pnpm lint`, `pnpm format`).
  - No se adoptó la guía de Airbnb, que es una sugerencia: los nombres y comentarios van en español por decisión del proyecto.

## Mobile-first y 3 breakpoints

Los estilos base son para celular y las media queries agregan lo de pantallas más grandes ([src/index.css](../src/index.css), al principio está la definición).

| Breakpoint | Ancho | Menú | Tarjetas | Grillas |
|:--|:--|:--|:--|:--|
| SM | hasta 767 px | Desplegable sobre el contenido | 1 columna | Columnas secundarias ocultas (`hideAtMedia`), celdas compactas, nombres en dos líneas |
| MD | 768 a 991 px | Desplegable | 2 columnas | Todas las columnas de posiciones, celdas compactas |
| LG | desde 992 px | Fijo a la izquierda | 3 columnas | Todas las columnas |

Ejemplos para mostrar:
- **Menú:** [Layout.css](../src/componentes/layout/Layout.css).
- **Columnas según el ancho:**
  - Posiciones: G, E, P, GF y GC desde MD ([PosicionesPagina.tsx](../src/paginas/PosicionesPagina.tsx)).
  - Detalle: día y hora desde MD, cancha desde LG ([DetalleEquipoPagina.tsx](../src/paginas/DetalleEquipoPagina.tsx)).
- **Torneos en celular:** el estado se muestra debajo del nombre ([TorneosPagina.tsx](../src/paginas/TorneosPagina.tsx)).
- **Cifras del equipo:** 3, 5 o 9 por fila según el ancho.

Se verificó cada pantalla en el navegador a 375, 800 y 1280 px (ver "Cómo probarlo" de cada etapa en el [plan de desarrollo](plan-de-desarrollo.md)).

## UX/UI: que no haga falta un manual

- **Navegación:**
  - Menú con íconos y la opción actual marcada.
  - Cada pantalla tiene título y una descripción de para qué sirve.
  - La pestaña del navegador muestra la pantalla actual ("Posiciones · LigaHub").
- **Estados vacíos que guían:**
  - "Todavía no hay torneos. Creá uno en la pantalla Torneos."
  - En Fixture, si faltan equipos: "Se necesitan al menos 2 equipos inscriptos (hay 0)", con enlace a Inscripciones.
- **Acciones explicadas antes de hacerlas:**
  - Confirmación antes de borrar o deshacer.
  - El diálogo del fixture muestra cuántas fechas y partidos se van a crear y que se cierran las inscripciones.
- **Acciones que no corresponden, deshabilitadas con el motivo:** inscripciones de un torneo en curso ("Las inscripciones de este torneo están cerradas: solo se pueden consultar").
- **Resultado de cada operación:** aviso verde (éxito) o rojo (error) abajo al centro.
- **Validación mientras se completa el formulario**, con el mensaje debajo del campo y el foco en el primer error.
- **Valores por defecto razonables:**
  - El año actual al crear un torneo.
  - El torneo en curso en Posiciones y Fixture.
  - El torneo en inscripción en Inscripciones.
- **Referencias donde hacen falta:** abreviaturas y criterio de desempate debajo de la tabla de posiciones.

## Manejo de eventos del usuario (click, input)

| Evento | Dónde |
|:--|:--|
| Click | Botón del menú que abre y cierra ([Layout.tsx:38](../src/componentes/layout/Layout.tsx#L38)); "Nuevo torneo" ([TorneosPagina.tsx:115](../src/paginas/TorneosPagina.tsx#L115)); modificar y borrar en cada fila ([AccionesFila.tsx:19](../src/componentes/comunes/AccionesFila.tsx#L19)) |
| Input (cada tecla) | Campos de texto: el evento `input` del TextBox actualiza el formulario ([CampoTexto.tsx:49](../src/componentes/formularios/CampoTexto.tsx#L49)) |
| Change | Listas desplegables ([CampoLista.tsx:69](../src/componentes/formularios/CampoLista.tsx#L69)), selector de torneo ([SelectorTorneo.tsx:41](../src/componentes/torneos/SelectorTorneo.tsx#L41)), casilla y fecha y hora |
| Submit | Formularios con `onSubmit` (botón Guardar o Enter) ([FormularioTorneo.tsx](../src/componentes/torneos/FormularioTorneo.tsx)) |
| Teclado | Escape cierra los diálogos ([Dialogo.tsx](../src/componentes/comunes/Dialogo.tsx)) |

## Manejo amigable de errores

| Situación | Qué ve el usuario | Dónde |
|:--|:--|:--|
| Dato inválido en un formulario | Mensaje debajo del campo, antes de enviar (Zod) | [validaciones/](../src/validaciones/) |
| El backend rechaza un dato (400 con detalles) | Mensaje debajo del campo que corresponde | [errores-servidor.ts](../src/componentes/formularios/errores-servidor.ts) |
| Regla de negocio (409): nombre repetido, inscripciones cerradas | Recuadro de error dentro del diálogo, que queda abierto | [errores-servidor.ts:24](../src/componentes/formularios/errores-servidor.ts#L24) |
| Error al borrar o deshacer | Aviso rojo con el motivo del backend | [TorneosPagina.tsx:69](../src/paginas/TorneosPagina.tsx#L69) |
| Servidor caído o sin conexión | "No se pudo conectar con el servidor…" y botón Reintentar | [cliente-api.ts:33](../src/api/cliente-api.ts#L33), [MensajeError.tsx](../src/componentes/comunes/MensajeError.tsx) |
| Registro inexistente (404) | Mensaje del backend, sin "Reintentar" (no serviría) | [DetalleEquipoPagina.tsx](../src/paginas/DetalleEquipoPagina.tsx) |
| Dirección inexistente | Página "no encontrada" con enlace al inicio | [NoEncontradaPagina.tsx](../src/paginas/NoEncontradaPagina.tsx) |
| Error inesperado al dibujar una pantalla | "Algo salió mal", con recargar o volver al inicio, sin perder el menú | [ErrorRutaPagina.tsx](../src/paginas/ErrorRutaPagina.tsx), [rutas.tsx:26](../src/rutas.tsx#L26) |

Todos los errores de la API pasan por la clase `ErrorApi` ([error-api.ts:11](../src/api/error-api.ts#L11)), que toma el mensaje en español que arma el backend.

## Reactividad ante un cambio de estado

- **`useState`:** el menú se abre y se cierra con `menuAbierto` ([Layout.tsx:26](../src/componentes/layout/Layout.tsx#L26)). Al cambiarlo, React vuelve a dibujar el componente: es el `StateHasChanged` de Blazor. También qué diálogo está abierto en cada pantalla (`edicion`, `aBorrar`).
- **Valores derivados:**
  - En el diálogo del fixture, el resumen ("6 fechas de 2 partidos") cambia al marcar "ida y vuelta" ([FormularioGenerarFixture.tsx:41](../src/componentes/fixture/FormularioGenerarFixture.tsx#L41)).
  - La vista previa del escudo cambia mientras se escribe la URL ([FormularioEquipo.tsx:39](../src/componentes/equipos/FormularioEquipo.tsx#L39)).
- **Datos del servidor:** al guardar, se invalida la caché y todas las pantallas que muestran esos datos se actualizan solas ([hooks/](../src/hooks/)).
- **Estado en la URL:** el torneo elegido en el selector cambia `?torneo=` y la pantalla se vuelve a dibujar con ese torneo ([torneo-seleccionado.hook.ts](../src/hooks/torneo-seleccionado.hook.ts)).

## Input property y output property

En React, una **input property** es una prop que el componente recibe para mostrar (el `[Parameter]` de Blazor). Una **output property** es una función recibida por prop que el componente llama para avisar algo (el `EventCallback`).

| Componente | Input property | Output property |
|:--|:--|:--|
| [SelectorTorneo](../src/componentes/torneos/SelectorTorneo.tsx#L13) | `torneos`, `valor` (torneo elegido) | `onCambiar(torneoId)` |
| [MenuNavegacion](../src/componentes/layout/MenuNavegacion.tsx#L13) | `items` (opciones del menú) | `onNavegar()` |
| [AccionesFila](../src/componentes/comunes/AccionesFila.tsx) | `descripcion` | `onModificar()`, `onBorrar()` |
| [FormularioTorneo](../src/componentes/torneos/FormularioTorneo.tsx) | `torneo` (a modificar) | `onGuardar(datos)`, `onCancelar()` |
| [DialogoConfirmacion](../src/componentes/comunes/DialogoConfirmacion.tsx) | `titulo`, `mensaje`, `procesando` | `onConfirmar()`, `onCancelar()` |
| [MensajeError](../src/componentes/comunes/MensajeError.tsx) | `error` | `onReintentar()` |

El ejemplo más claro para la defensa es `SelectorTorneo`: no guarda estado propio. Muestra el `valor` que le pasan y avisa con `onCambiar`; la pantalla decide qué hacer. Es el patrón `Value` / `ValueChanged` de Blazor.

## Al menos un servicio

Un servicio por recurso de la API, sobre un cliente común que centraliza la URL, el JSON y los errores:

| Servicio | Endpoints |
|:--|:--|
| [torneosServicio](../src/servicios/torneos.servicio.ts) | `/torneos` |
| [equiposServicio](../src/servicios/equipos.servicio.ts) | `/equipos` |
| [inscripcionesEquipoServicio](../src/servicios/inscripciones-equipo.servicio.ts) | `/torneos/:id/inscripciones` |
| [posicionesServicio](../src/servicios/posiciones.servicio.ts) | `/torneos/:id/posiciones`, `/torneos/:id/equipos/:id` |
| [fixtureServicio](../src/servicios/fixture.servicio.ts) | `/torneos/:id/fixture` |

Cliente: [cliente-api.ts](../src/api/cliente-api.ts). Notificaciones: servicio compartido por contexto ([contexto-notificaciones.ts](../src/componentes/notificaciones/contexto-notificaciones.ts)).

## Modelos con clases, interfaces y tipos

- **Interfaces** de cada entidad tal como la devuelve la API ([src/modelos/](../src/modelos/)): `Torneo`, `Equipo`, `InscripcionEquipo`, `FilaPosiciones`, `DetalleEquipo`, `PartidoDetalle`, `JugadorDetalle`, `FechaFixture`, `PartidoFixture`.
- **Tipos derivados:**
  - `ModificarTorneo = Partial<CrearTorneo>`.
  - `ResultadoPartido = 'Ganado' | 'Empatado' | 'Perdido'`.
  - Los estados como objeto `as const` con su tipo (`EstadoTorneo`, `EstadoPartido`) ([estados.ts](../src/modelos/estados.ts)).
- **Tipos deducidos de los esquemas de validación:** `DatosFormularioTorneo = z.infer<typeof esquemaTorneo>` ([validaciones/](../src/validaciones/)).
- **Clase:** `ErrorApi extends Error`, con estado HTTP, detalles por campo y un método de fábrica `desdeRespuesta` ([error-api.ts](../src/api/error-api.ts)).

## Patrones de diseño

| Patrón | Dónde |
|:--|:--|
| **Adapter** | `CampoTexto`, `CampoNumero`, `CampoLista`, `CampoFechaHora` y `CampoCasilla` adaptan cada componente de Syncfusion (con sus propios eventos) a la interfaz de React Hook Form ([formularios/](../src/componentes/formularios/)) |
| **Facade** | Los servicios esconden `fetch`, las URL y la conversión de errores detrás de métodos como `torneosServicio.crear(datos)` |
| **Factory Method** | `ErrorApi.desdeRespuesta(estado, cuerpo)` arma el error a partir de la respuesta ([error-api.ts:25](../src/api/error-api.ts#L25)) |
| **Observer** | TanStack Query: las pantallas se suscriben a datos por clave y se actualizan cuando cambian. El contexto de notificaciones funciona igual |
| **Inyección de dependencias** | `ProveedorNotificaciones` ofrece el servicio de avisos y cada pantalla lo pide con `useNotificaciones()`, como un `@inject` |

## Dependencias registradas

Todas en [package.json](../package.json), separadas en `dependencies` (ejecución) y `devDependencies` (desarrollo: TypeScript, Vite, oxlint, Prettier, tipos). El lockfile `pnpm-lock.yaml` fija las versiones exactas instaladas.
