# Scafkit

Interactive starter-project generator for PHP MVC, PERN, and React TypeScript apps.

The `scafkit` command opens the interactive shell and also accepts commands directly.

## Install

```bash
npm install -g scafkit-cli
scafkit
```

## Commands

### PHP MVC Starter

```bash
scafkit php my-login-app
scafkit php .
scafkit php my-login-app --force
```

Creates a PHP MVC authentication starter with controllers, models, views, session handling, routing, database config, `.env.example`, and SQL schema.

After generating:

```bash
cd my-login-app
cp .env.example .env
php -S localhost:8000 -t public
```

### PHP Controller Scaffold

```bash
scafkit make:controller Invoice
scafkit make:controller Invoice approve reject
```

Creates a controller in `app/Controllers` inside the current PHP project. Extra method names become controller methods. With no extra methods, the controller only includes the default `index()` method.

Example:

```bash
scafkit make:controller Invoice approve reject
```

Creates:

```txt
app/Controllers/InvoiceController.php
```

With:

```php
index()
approve()
reject()
```

### PERN Starter

```bash
scafkit pern my-app
scafkit pern my-app --tw
scafkit pern my-app --js
scafkit pern my-app --sq-pg
scafkit pern my-app --sq-mysql --tw
scafkit pern my-app --sq-sqlite
scafkit pern my-app --sq-mariadb
scafkit pern my-app --sq-mssql
scafkit pern . --sq-pg --tw --force
```

Creates a full-stack project with only two root folders:

```txt
client/
server/
```

The default backend uses PostgreSQL with `pg`. Sequelize mode uses Sequelize v7 alpha with a dialect-specific package:

| Flag | Database |
| --- | --- |
| `--sq-pg` | PostgreSQL |
| `--sq-mysql` | MySQL |
| `--sq-sqlite` | SQLite |
| `--sq-mariadb` | MariaDB |
| `--sq-mssql` | Microsoft SQL Server |

`--sequelize` is still accepted as an alias for `--sq-pg`.

Use `--tw` to include Tailwind CSS v4 in the React client.

Scafkit asks whether you want TypeScript or JavaScript when creating React or PERN projects. You can skip the prompt with `--ts` or `--js`.

After generating:

```bash
cd my-app/server
scafkit server/src/index.ts
```

In another terminal:

```bash
cd my-app/client
scafkit run
```

Client: `http://localhost:5173`  
Server: `http://localhost:4000`

### React TypeScript Starter

```bash
scafkit react my-frontend
scafkit react my-frontend --tw
scafkit react my-frontend --js
scafkit react my-frontend --serverless
scafkit react my-frontend --serverless --tw
scafkit react . --serverless --tw --force
```

Creates a React TypeScript app with a senior-friendly structure:

```txt
src/app/
src/components/
src/features/
src/lib/
```

Use `--tw` to include Tailwind CSS v4. Use `--serverless` to include Netlify Functions:

Scafkit asks whether you want TypeScript or JavaScript. Use `--ts` or `--js` to choose directly.

```txt
netlify/functions/hello.ts
netlify.toml
```

After generating:

```bash
cd my-frontend
scafkit run
```

For serverless mode:

```bash
scafkit run
```

## Utility Commands

| Command | Description |
| --- | --- |
| `help` | Show available commands |
| `help php` | Show PHP-specific help |
| `help pern` | Show PERN-specific help |
| `help react` | Show React-specific help |
| `clear` / `cls` | Clear and redraw the CLI |
| `pwd` | Print the current working directory |
| `cd <folder>` | Change the current working directory |
| `make:controller <name> [methods...]` | Create a PHP controller in the current Scafkit PHP project |
| `scafkit run` / `run` | Install missing Node dependencies and open the React/Vite dev server |
| `scafkit <file>` | Install missing Node dependencies and run a backend `.js` or `.ts` entry file with nodemon |
| `scafkit run php` / `run php` | Open a PHP project with XAMPP link detection or PHP's built-in server |
| `update` / `scafkit update` | Check npm for a newer CLI version |
| `exit` / `quit` | Close the CLI |

## Update Command

Inside the CLI shell:

```bash
update
scafkit update
```

If a newer version exists, Scafkit shows a terminal confirmation box. Use the left/right arrow keys to select `Yes` or `No`, then press Enter. Selecting `Yes` installs the latest global version from npm.

## Release Security

Before publishing, Scafkit runs:

```bash
npm run check
npm run security
```

`npm run security` runs `npm audit --audit-level=moderate` and blocks publishing on moderate or higher npm advisories.

For the stricter Socket.dev supply-chain policy check, run:

```bash
npm run security:strict
```

Run `npm run security:socket:login` or set `SOCKET_SECURITY_API_TOKEN` before using the strict Socket check.

## License

MIT
