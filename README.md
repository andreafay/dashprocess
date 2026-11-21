# Hiring Dashboard

A desktop Kanban board for tracking hiring processes. Built with Electron, React, TypeScript, Tailwind and SQLite.

## Requirements

- **Node.js 22.12 or newer** (npm comes with it)
- **Git**

That's all. You don't need Python, C++ build tools or SQLite. The database uses Electron's built-in `node:sqlite` module, so there's nothing native to compile.

Tested on Windows. macOS and Linux should work in dev mode, but they haven't been tested.

## Getting started

```powershell
git clone <repo-url>
cd hpdashboard
npm install
npm run dev
```

`npm run dev` opens the app with hot reload. The first launch shows `Downloading Electron binary...` and takes a little longer. Electron downloads itself the first time it's used, not during `npm install`.

### If the download fails

If you see `Electron failed to install correctly` (for example, because you were offline), run this, then run `npm run dev` again:

```powershell
node node_modules/electron/install.js
```

## Commands

| Command | What it does |
|---|---|
| `npm run dev` | Starts the app with hot reload |
| `npm run typecheck` | TypeScript checks for the main process and renderer |
| `npm run build` | Typechecks, then builds into `out/` |
| `npm run preview` | Runs the production build from `out/` |
| `npm run build:win` | Builds a Windows installer: `dist/hpdashboard-<version>-setup.exe` |

## Where data lives

The database isn't stored in the repo. The app creates it on first launch, with the five default stages and no processes:

```
%APPDATA%\Hiring Dashboard\hpdashboard.db
```

- **Everyone starts fresh:** each person who clones the repo gets their own empty board.
- **The dev app and the installed app share it:** on the same machine, both use this one file.
- **Back it up:** close the app, then copy the file.
- **Start over:** close the app, then delete the `Hiring Dashboard` folder.

On macOS the folder is `~/Library/Application Support/Hiring Dashboard/`, and on Linux it's `~/.config/Hiring Dashboard/`.

## How it's built

| Layer | Path | Notes |
|---|---|---|
| Shared types | `src/shared/types.ts` | `Stage`, `Process`, `ProcessInput`, and the `window.api` contract |
| Database | `src/main/db.ts` | Opens the DB and runs migrations, versioned with `PRAGMA user_version` |
| Queries | `src/main/repo.ts` | All SQL. Validates input and keeps card and stage positions consistent |
| IPC | `src/main/ipc.ts`, `src/preload/index.ts` | `window.api.stages.*`, `window.api.processes.*`, `window.api.settings.*` |
| UI state | `src/renderer/src/store.ts` | zustand store: search and optimistic card moves |
| UI | `src/renderer/src/components/` | Board (dnd-kit), columns, cards, dialogs, theme toggle |
| Theme | `src/renderer/src/index.css` | Colour tokens for light and dark mode, including the yellow accent |

### Changing the schema

Add a new function to the end of `MIGRATIONS` in `src/main/db.ts`. Don't edit migrations that already exist: databases that already ran them won't run them again.

### Stages

Stages (the board's columns) are database rows. Add, rename, reorder or delete them from **Manage stages** or from a column's `⋯` menu. To delete a stage that still has processes, you pick a stage to move them to first.
