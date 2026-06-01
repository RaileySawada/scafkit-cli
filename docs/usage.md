# Scafkit CLI Usage

Run `scafkit help` for the command overview, or use focused guides with `scafkit help php`, `scafkit help pern`, and `scafkit help react`.

## Create Projects

```bash
scafkit react my-app
scafkit pern my-stack
scafkit php my-auth-app
```

You can also use the explicit form:

```bash
scafkit create react my-app
scafkit create pern my-stack
scafkit create php my-auth-app
```

Common flags:

```bash
scafkit react my-app --dir ../projects
scafkit pern my-stack --yes
scafkit php my-auth-app --dry-run
scafkit react my-app --force
```

## React

Create a React starter:

```bash
scafkit react dashboard
```

Create with Tailwind:

```bash
scafkit react dashboard --tw
```

Choose JavaScript or TypeScript:

```bash
scafkit react dashboard --js
scafkit react dashboard --ts
```

Add Netlify Functions:

```bash
scafkit react dashboard --serverless
```

Skip dependency installation or choose a package manager:

```bash
scafkit react dashboard --no-install
scafkit react dashboard --pm pnpm
```

Run the generated app:

```bash
cd dashboard
scafkit run
```

## PERN

Create a PERN starter with React client and Express API:

```bash
scafkit pern workspace
```

Create with Tailwind in the client:

```bash
scafkit pern workspace --tw
```

Choose JavaScript or TypeScript:

```bash
scafkit pern workspace --js
scafkit pern workspace --ts
```

Choose a Sequelize dialect:

```bash
scafkit pern workspace --sq-pg
scafkit pern workspace --sq-mysql
scafkit pern workspace --sq-sqlite
scafkit pern workspace --sq-mariadb
scafkit pern workspace --sq-mssql
```

Run both the API and client:

```bash
cd workspace
scafkit run pern
```

Check or stop tracked servers:

```bash
scafkit status
scafkit stop all
```

## PHP

Create a PHP MVC authentication starter:

```bash
scafkit php auth-app
```

Choose the styling mode:

```bash
scafkit php auth-app
scafkit php auth-app --tw
scafkit php auth-app --bs
```

The generated PHP app includes editable routes, controllers, models, views, login-attempt tracking, `.env.example`, and `database.sql`.

Before using login features, create the database and import the generated schema:

```bash
mysql -u root -p < database.sql
```

Copy the environment file and set your database credentials:

```bash
copy .env.example .env
```

Run the PHP app:

```bash
cd auth-app
scafkit run php
```

Create PHP controllers:

```bash
scafkit make:controller Invoice
scafkit make:controller Invoice approve reject
```

Create routes and scaffold missing MVC files:

```bash
scafkit make:route GET /invoices InvoiceController@index
scafkit make:route POST /invoices InvoiceController@store
```

`make:route` preserves existing files. If a controller already exists, Scafkit only adds the missing action method.

## Utility Commands

```bash
scafkit list
scafkit inspect
scafkit doctor
scafkit update --check
scafkit status
scafkit stop all
```
