# LigaHub — Frontend

[![Tests](https://github.com/mateorindello1/LigaHub-FE/actions/workflows/tests.yml/badge.svg)](https://github.com/mateorindello1/LigaHub-FE/actions/workflows/tests.yml)

Repositorio de Front-End del proyecto LigaHub para la materia Desarrollo de Software — Ingeniería en Sistemas de Información — UTN FRRo — 2026.

LigaHub es un sistema de gestión de torneos de fútbol: torneos, equipos, jugadores, inscripciones, generación del fixture y carga de resultados.

## Integrantes

| Nombre | Legajo | GitHub |
|:--|:-:|:--|
| Mateo Rindello | 47216 | [mateorindello1](https://github.com/mateorindello1) |
| Juan Urquiza | 54666 | [juan-urquiza3](https://github.com/juan-urquiza3) |

## Repositorios

- Frontend: este repositorio.
- Backend: [LigaHub-BE](https://github.com/mateorindello1/LigaHub-BE)

## Stack

| Capa | Tecnología |
|:--|:--|
| Lenguaje | TypeScript |
| Framework | React 19 |
| Herramienta de compilación y servidor de desarrollo | Vite |
| Biblioteca de componentes | Syncfusion para React, tema Material 3 |
| Ruteo | React Router |
| Pedidos a la API | Servicio propio sobre `fetch` + TanStack Query |
| Formularios y validación | React Hook Form + Zod |
| Tests | Vitest + Testing Library (componentes) y Playwright (end-to-end) |
| Linter y formato | oxlint + Prettier |
| Gestor de paquetes | pnpm |

## Requisitos

- [fnm](https://github.com/Schniz/fnm) (o cualquier gestor de versiones de Node). La versión está fijada en `.node-version`.
- [pnpm](https://pnpm.io/)
- El backend ([LigaHub-BE](https://github.com/mateorindello1/LigaHub-BE)) levantado.
- Una clave de licencia de Syncfusion. Sin clave, los componentes funcionan pero muestran un aviso de licencia.

## Instalación

```bash
fnm use
pnpm install
```

Copiar `.env.example` como `.env` y completar los valores:

| Variable | Qué es |
|:--|:--|
| `VITE_API_URL` | URL de la API (por defecto `http://localhost:3000`) |
| `VITE_SYNCFUSION_LICENSE` | Clave de licencia de Syncfusion |

## Scripts

| Comando | Qué hace |
|:--|:--|
| `pnpm dev` | Levanta la aplicación en modo desarrollo en [http://localhost:5173](http://localhost:5173), con recarga automática |
| `pnpm build` | Verifica los tipos y compila a `dist/` |
| `pnpm preview` | Sirve la versión compilada, para probarla |
| `pnpm test` | Tests de componentes y unitarios |
| `pnpm test:watch` | Lo mismo, y se vuelven a correr al guardar |
| `pnpm test:cov` | Tests de componentes con cobertura |
| `pnpm test:e2e` | Tests end-to-end con Playwright (necesitan la API y Microsoft Edge) |
| `pnpm lint` | Linter |
| `pnpm format` | Formatea el código con Prettier |

El puerto 5173 es fijo porque el backend solo acepta pedidos desde ese origen (variable `CORS_ORIGIN` del backend).

## Tests

21 tests de componentes y unitarios (Vitest + Testing Library) y 4 end-to-end que recorren la aplicación en el navegador (Playwright), incluidos los dos casos de uso. Cómo correrlos, qué cubren y la evidencia de ejecución: [`docs/tests.md`](docs/tests.md). Los tests de componentes corren en GitHub Actions en cada push a `main`.
