# Changelog

## 1.0.4

### CLI

- Added dependency-install confirmation with radio-style keyboard selection.
- Added `--no-install` for React and PERN project creation.
- Added `--pm <npm|pnpm|yarn|bun>` for package-manager-aware dependency installation.
- Added `doctor` to check local Scafkit, Node, npm, Git, PHP, Composer, and package-manager availability.
- Added `inspect` to detect the current project and list package scripts.
- Added `update --check` for update checks without installing.
- Expanded Ora spinner usage across diagnostics, inspection, server status checks, generation, installation, and update flows.

### Design

- Removed red from normal CLI styling and reserved it for errors.
- Updated confirmation prompts to use blue radio controls.
- Updated the banner to use a blue-only vertical gradient.

## 1.0.3

### CLI

- Added `create` and `new` commands for explicit starter creation.
- Added `list`, `templates`, and version commands.
- Added `--yes`, `--dir`, and `--dry-run` project creation options.
- Improved command help output for the new options.

### Documentation

- Reworked the README into a user-focused guide with install steps, examples, starter options, and utility commands.

### Security

- Updated Socket.dev CLI development dependency to `^1.1.111`.

## 1.0.1

### Security

- Added Socket.dev CLI as a development dependency for supply-chain scanning.
- Added `npm run security` for npm audit release checks.
- Added `npm run security:strict` for npm audit plus Socket.dev policy checks.
- Added `prepublishOnly` gate so releases must pass syntax checks and npm audit before publishing.
- Added package publish allowlist through `files` to keep release tarballs limited to CLI source, generators, README, and package metadata.

### Runtime

- Improved managed server status checks for PHP, React, and PERN dev servers.
- Improved XAMPP detection and PHP server fallback behavior.
- Let generated PERN APIs start even when the database is not ready.
- Deferred PHP database model creation until login/reset actions actually need the database.

### Scaffolding

- Ensured Tailwind optional dependencies are installed when `--tw` is used.
