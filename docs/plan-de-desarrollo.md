# Plan de desarrollo — LigaHub Frontend

Registro de lo que se va haciendo, etapa por etapa: qué comandos se ejecutaron, qué archivos se crearon y para qué sirve cada cosa. Sirve para entender el proyecto y para poder rehacerlo desde cero.

Cada etapa tiene un estado: **Hecha**, **En curso** o **Pendiente**. Las etapas pendientes son una guía y pueden cambiar a medida que avancemos.

Como referencia, cada concepto se compara con su equivalente en Blazor.

El plan del backend está en [LigaHub-BE/docs/plan-de-desarrollo.md](https://github.com/mateorindello1/LigaHub-BE/blob/main/docs/plan-de-desarrollo.md).

## Índice

| # | Etapa | Estado |
|:-:|:--|:-:|
| 0 | [Repositorio local](#etapa-0--repositorio-local) | Hecha |
| 1 | [Decisiones de stack](#etapa-1--decisiones-de-stack) | En curso |
| 2 | [Andamiaje del proyecto](#etapa-2--andamiaje-del-proyecto) | Pendiente |
| 3 | [Base de la aplicación: layout, rutas, servicio de API y tipos](#etapa-3--base-de-la-aplicación-layout-rutas-servicio-de-api-y-tipos) | Pendiente |
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
| `README.md` | Una línea de descripción. **Dice "Repositorio de Back-End"**: hay que corregirlo |
| `proposal.md` | La propuesta del TP, todavía con los problemas detectados (ver etapa 9) |

No tiene código ni `.gitignore`.

---

## Etapa 1 — Decisiones de stack

**Estado:** En curso (2026-10-09)

### Decididas

| Decisión | Elección | Por qué |
|:--|:--|:--|
| Framework | **React + Vite + TypeScript** | Es el stack declarado del proyecto. Vite es el generador y servidor de desarrollo estándar para React |
| Biblioteca de componentes | **Syncfusion para React** | Ya la conocés de Blazor: grilla, diálogos, formularios y datepickers funcionan con los mismos conceptos, y las pantallas CRUD salen rápido. Cumple el requisito de la cátedra de seguir una biblioteca de componentes |
| Gestor de paquetes y Node | **pnpm y Node 24** | Mismo entorno que el backend |

### Propuestas, a confirmar al generar el proyecto

| Decisión | Propuesta | Por qué |
|:--|:--|:--|
| Tema de Syncfusion | Material o Tailwind | Define el estilo visual de todos los componentes |
| Ruteo | React Router | Es el estándar para navegar entre pantallas |
| Pedidos a la API | Servicio propio sobre `fetch` + TanStack Query | El servicio cumple el requisito de la cátedra. TanStack Query maneja la carga, los errores y el refresco después de guardar: lo que en tus ViewModels es "recargar la grilla tras éxito" |
| Formularios | React Hook Form + Zod | Validación declarativa, como DataAnnotations en el modelo |

### Cuidados con Syncfusion

- **Licencia:** es comercial. Se usa la **Community License** gratuita (verificar las condiciones vigentes en [su sitio](https://www.syncfusion.com/products/communitylicense)). Hay que registrarse, obtener una clave y cargarla con `registerLicense()` al iniciar la aplicación; si no, aparece un aviso en pantalla. La clave va en una variable de entorno, no escrita en el código.
- **No usar el `DataManager` de la grilla:** los datos se piden con TanStack Query y se le pasa a la grilla un arreglo común. Así hay un solo mecanismo de datos en la aplicación.
- **Componentes propios que envuelvan a los de Syncfusion** (por ejemplo, `<TablaTorneos>` que recibe los datos por prop y avisa la selección con una función). Es lo mismo que hacés en el trabajo con tus componentes sobre Syncfusion, y es lo que permite mostrar en la defensa input property, output property y reactividad en código propio.
- **Importar solo los módulos que se usan**, porque los paquetes son pesados.

### Pendiente fuera del código

- **Declarar React y NestJS en la proposal y pedir la aprobación del profesor.** La cátedra da soporte a Node, Express y Angular; otras tecnologías hay que informarlas y que se aprueben. Conviene hacerlo cuanto antes por la fecha de entrega.

## Etapa 2 — Andamiaje del proyecto

**Estado:** Pendiente

- Generar el proyecto con Vite (plantilla React + TypeScript) en la carpeta del repo.
- `.node-version`, `.gitignore`, linter y formato.
- Verificar que levanta en modo desarrollo y que compila.

## Etapa 3 — Base de la aplicación: layout, rutas, servicio de API y tipos

**Estado:** Pendiente

- Layout **mobile-first** que se vea bien en los tres breakpoints exigidos: SM, MD y LG. La grilla de Syncfusion tiene un modo adaptativo para pantallas chicas, pero hay que verificar los tres tamaños.
- Registro de la licencia de Syncfusion y carga del tema.
- Rutas de la aplicación.
- Servicio de API con la URL del backend configurable por ambiente.
- Tipos e interfaces del dominio (Torneo, Equipo, Inscripción…), que representan los modelos de datos, como pide la cátedra.

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

- Corregir el `README.md` (dice "Back-End").
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
