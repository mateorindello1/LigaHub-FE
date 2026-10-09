# Plan de desarrollo — LigaHub Frontend

Registro de lo que se va haciendo, etapa por etapa: qué comandos se ejecutaron, qué archivos se crearon y para qué sirve cada cosa. Sirve para entender el proyecto y para poder rehacerlo desde cero.

Cada etapa tiene un estado: **Hecha**, **En curso** o **Pendiente**. Las etapas pendientes son una guía y pueden cambiar a medida que avancemos.

Como referencia, cada concepto se compara con su equivalente en Blazor.

El plan del backend está en [LigaHub-BE/docs/plan-de-desarrollo.md](https://github.com/mateorindello1/LigaHub-BE/blob/main/docs/plan-de-desarrollo.md).

## Índice

| # | Etapa | Estado |
|:-:|:--|:-:|
| 0 | [Repositorio local](#etapa-0--repositorio-local) | Hecha |
| 1 | [Decisiones de stack](#etapa-1--decisiones-de-stack) | Pendiente |
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

**Estado:** Pendiente

Hay que definir antes de generar el proyecto:

| Decisión | Propuesta | Por qué |
|:--|:--|:--|
| Framework | React + Vite + TypeScript | Es lo declarado en el stack del proyecto. La cátedra da soporte a Angular: usar React hay que informarlo en la proposal y que el profesor lo apruebe |
| Biblioteca de componentes / CSS | A definir (la cátedra sugiere Pico.css, Bulma, Material, Tailwind o Bootstrap) | Es requisito seguir una biblioteca o guía de estilos |
| Ruteo | React Router | Navegación entre pantallas |
| Pedidos a la API | Un servicio propio sobre `fetch` y, opcionalmente, TanStack Query para caché y estados de carga | Es requisito implementar al menos un servicio |
| Gestor de paquetes y Node | pnpm y Node 24, igual que el backend | Mismo entorno en los dos repos |

## Etapa 2 — Andamiaje del proyecto

**Estado:** Pendiente

- Generar el proyecto con Vite (plantilla React + TypeScript) en la carpeta del repo.
- `.node-version`, `.gitignore`, linter y formato.
- Verificar que levanta en modo desarrollo y que compila.

## Etapa 3 — Base de la aplicación: layout, rutas, servicio de API y tipos

**Estado:** Pendiente

- Layout **mobile-first** que se vea bien en los tres breakpoints exigidos: SM, MD y LG.
- Rutas de la aplicación.
- Servicio de API con la URL del backend configurable por ambiente.
- Tipos e interfaces del dominio (Torneo, Equipo, Inscripción…), que representan los modelos de datos, como pide la cátedra.

## Etapa 4 — Pantallas CRUD: Torneo y Equipo

**Estado:** Pendiente

- Patrón grilla + modal, como en tu trabajo: listado, alta, edición y baja, recargando la grilla después de cada operación exitosa.
- Componentes reutilizables (formulario, tabla, modal de confirmación).

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

- Login y protección de rutas según los niveles de acceso del backend.
- Un test unitario de componente y un test end-to-end.
- Ambientes definidos (`.env`).
