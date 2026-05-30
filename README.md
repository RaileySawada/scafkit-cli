# Scafkit CLI

Scafkit is an interactive project scaffolding CLI for creating PHP MVC, PERN, and React starter apps.

## Installation

```bash
npm install -g scafkit-cli
```

Run the interactive shell:

```bash
scafkit
```

Or create a project directly:

```bash
scafkit create react my-app --tw --yes
```

## Available Starters

| Starter | Command | Creates |
| --- | --- | --- |
| PHP MVC | `scafkit php my-app` | PHP authentication starter with MVC folders, routes, views, `.env.example`, and SQL schema |
| PERN | `scafkit pern my-app` | React client and Express API with PostgreSQL-ready server structure |
| React | `scafkit react my-app` | React app with a scalable `src` layout and optional Netlify Functions |

You can also use the explicit create form:

```bash
scafkit create php my-app
scafkit create pern my-app
scafkit create react my-app
```

## Common Options

| Option | Description |
| --- | --- |
| `--help` | Show help for a command |
| `--version` | Print the installed Scafkit version |
| `--list` | List available starters |
| `--dir <path>` | Create the project inside another directory |
| `--dry-run` | Preview generated files without writing them |
| `--force` | Overwrite existing generated files |
| `--yes`, `-y` | Use default answers for prompts |

## React Starter

```bash
scafkit react my-frontend
scafkit react my-frontend --tw
scafkit react my-frontend --js
scafkit react my-frontend --serverless
scafkit react my-frontend --serverless --tw --yes
```

React options:

| Option | Description |
| --- | --- |
| `--tw`, `--tailwind` | Include Tailwind CSS |
| `--serverless` | Include Netlify Functions |
| `--ts`, `--typescript` | Generate TypeScript files |
| `--js`, `--javascript` | Generate JavaScript files |

After generating:

```bash
cd my-frontend
scafkit run
```

## PERN Starter

```bash
scafkit pern my-app
scafkit pern my-app --tw
scafkit pern my-app --js
scafkit pern my-app --sq-pg
scafkit pern my-app --sq-mysql --tw
scafkit pern my-app --sq-sqlite
```

PERN database options:

| Option | Database |
| --- | --- |
| `--sq-pg` | PostgreSQL with Sequelize |
| `--sq-mysql` | MySQL with Sequelize |
| `--sq-sqlite` | SQLite with Sequelize |
| `--sq-mariadb` | MariaDB with Sequelize |
| `--sq-mssql` | Microsoft SQL Server with Sequelize |

After generating:

```bash
cd my-app
```

Start the React client:

```bash
scafkit run
```

Start the Express API:

```bash
scafkit server/src/index.ts
```

## PHP MVC Starter

```bash
scafkit php my-login-app
scafkit php my-login-app --force
scafkit php . --dry-run
```

After generating:

```bash
cd my-login-app
cp .env.example .env
scafkit run php
```

## PHP Controller Generator

Inside a generated PHP project:

```bash
scafkit make:controller Invoice
scafkit make:controller Invoice approve reject
```

This creates:

```txt
app/Controllers/InvoiceController.php
```

Extra names become controller methods.

## Utility Commands

| Command | Description |
| --- | --- |
| `help` | Show command help |
| `help php` | Show PHP starter help |
| `help pern` | Show PERN starter help |
| `help react` | Show React starter help |
| `list` | Show available starters |
| `version` | Print the installed version |
| `pwd` | Print the current working directory |
| `cd <folder>` | Change the current working directory inside the Scafkit shell |
| `run` | Start a React or Vite project |
| `run php` | Start a PHP project |
| `status` | Show managed dev-server status |
| `stop` | Stop managed dev servers |
| `update` | Check npm for a newer Scafkit version |
| `exit` | Close the interactive shell |

## Examples

Preview a project without writing files:

```bash
scafkit react dashboard --tw --dry-run
```

Create a TypeScript PERN app in another directory:

```bash
scafkit create pern inventory --sq-pg --tw --dir ../projects --yes
```

Create a JavaScript React app:

```bash
scafkit react client --js
```

## License

MIT
