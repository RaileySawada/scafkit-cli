# Scafkit CLI

Scafkit is an interactive scaffolding CLI for creating PHP MVC, PERN, and React starter projects without rebuilding the same folder structure, scripts, and setup files by hand.

It is built for quick project starts: choose a template, pick TypeScript or JavaScript when needed, optionally include Tailwind or serverless functions, and let Scafkit generate the app with sensible defaults.

## Highlights

- Interactive shell and direct one-shot commands
- PHP MVC authentication starter
- PERN full-stack starter with React client and Express API
- React starter with optional Tailwind CSS and Netlify Functions
- TypeScript or JavaScript output for React and PERN
- Optional dependency installation with `npm`, `pnpm`, `yarn`, or `bun`
- `doctor`, `inspect`, `run`, `status`, `stop`, and `update` helper commands

## Installation

```bash
npm install -g scafkit-cli
```

Run the shell:

```bash
scafkit
```

Print the installed version:

```bash
scafkit --version
```

Check your local tooling:

```bash
scafkit doctor
```

## Creating Projects

Use the short template command:

```bash
scafkit react my-app
scafkit pern my-api
scafkit php my-auth-app
```

Or use the explicit create form:

```bash
scafkit create react my-app
scafkit create pern my-api
scafkit create php my-auth-app
```

Scafkit asks before installing dependencies. To accept defaults and install without prompts:

```bash
scafkit react my-app --yes
```

To generate files only:

```bash
scafkit react my-app --no-install
```

To install with another package manager:

```bash
scafkit react my-app --pm pnpm
scafkit pern my-api --pm yarn
scafkit react my-app --pm bun
```

## Templates

| Template | Command | Output |
| --- | --- | --- |
| React | `scafkit react my-app` | React app with scalable `src` layout, Vite scripts, optional Tailwind, and optional Netlify Functions |
| PERN | `scafkit pern my-api` | React client plus Express server, PostgreSQL-ready defaults, optional Sequelize dialects, and copied server `.env` |
| PHP MVC | `scafkit php my-auth-app` | PHP MVC authentication starter with controllers, models, views, routing, sessions, `.env.example`, and SQL schema |

## Flags

Common project flags:

| Flag | Description |
| --- | --- |
| `--dir <path>` | Create the project inside another directory |
| `--dry-run` | Preview generated files without writing them |
| `--force`, `-f` | Overwrite existing generated files |
| `--yes`, `-y` | Use defaults and install dependencies without prompting |
| `--no-install` | Skip dependency installation |
| `--pm <npm\|pnpm\|yarn\|bun>` | Choose the package manager for dependency installation |
| `--help`, `-h` | Show command help |

React flags:

| Flag | Description |
| --- | --- |
| `--tw`, `--tailwind` | Include Tailwind CSS |
| `--serverless` | Include Netlify Functions endpoints |
| `--ts`, `--typescript` | Generate TypeScript files |
| `--js`, `--javascript` | Generate JavaScript files |

PERN flags:

| Flag | Description |
| --- | --- |
| `--tw`, `--tailwind` | Include Tailwind CSS in the React client |
| `--ts`, `--typescript` | Generate TypeScript files |
| `--js`, `--javascript` | Generate JavaScript files |
| `--sq-pg`, `--sq-postgres` | Use Sequelize with PostgreSQL |
| `--sq-mysql` | Use Sequelize with MySQL |
| `--sq-sqlite` | Use Sequelize with SQLite |
| `--sq-mariadb` | Use Sequelize with MariaDB |
| `--sq-mssql` | Use Sequelize with Microsoft SQL Server |

PHP flags and helpers:

| Command or flag | Description |
| --- | --- |
| `--dir <path>` | Create the PHP starter inside another directory |
| `--dry-run` | Preview files without writing |
| `--force`, `-f` | Overwrite existing generated files |
| `scafkit make:controller Invoice` | Create `app/Controllers/InvoiceController.php` |
| `scafkit make:controller Invoice approve reject` | Create a controller with extra methods |

## Commands

| Command | Description |
| --- | --- |
| `scafkit` | Open the interactive shell |
| `scafkit help` | Show command help |
| `scafkit help react` | Show focused React help |
| `scafkit help pern` | Show focused PERN help |
| `scafkit help php` | Show focused PHP help |
| `scafkit list` | List available templates |
| `scafkit run` | Start the detected React/Vite app |
| `scafkit run pern` | Start PERN client and API servers |
| `scafkit run php` | Start or link a PHP project |
| `scafkit inspect` | Detect the current project and list scripts/package manager |
| `scafkit doctor` | Check Scafkit, Node, npm, Git, PHP, Composer, and package-manager availability |
| `scafkit update --check` | Check the latest npm version without installing |
| `scafkit update` | Check for an update and install after confirmation |
| `scafkit status` | Show managed dev-server status |
| `scafkit stop all` | Stop tracked dev servers |

## Examples

Create a React TypeScript app and choose whether to install dependencies:

```bash
scafkit react dashboard
```

Create a React app with Tailwind and install with pnpm:

```bash
scafkit react dashboard --tw --pm pnpm
```

Create a JavaScript React app without installing dependencies:

```bash
scafkit react client --js --no-install
```

Create a PERN app with Sequelize PostgreSQL and Tailwind:

```bash
scafkit pern inventory --sq-pg --tw
```

Create a PERN app in another directory and skip prompts:

```bash
scafkit create pern inventory --sq-mysql --dir ../projects --yes
```

Preview a PHP starter without writing files:

```bash
scafkit php auth-app --dry-run
```

Create a PHP controller:

```bash
scafkit make:controller Invoice approve reject
```

Inspect a generated project:

```bash
cd dashboard
scafkit inspect
```

Start local development:

```bash
scafkit run
scafkit run pern
scafkit run php
```

## License

MIT
