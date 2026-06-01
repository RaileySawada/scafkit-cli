# Changelog

## 1.0.8

### CLI

- Kept the published executable to a single `bin/scafkit.js` entry.
- Improved managed server behavior so Scafkit-started servers stay trackable through `status` and `stop` after reopening the CLI.

### PHP

- Refined the generated PHP login screen into a responsive Scafkit-branded terminal-style interface.
- Updated login-attempt display to start at `Login attempts: 0` and reflect stored database attempts after authentication is connected.
- Added a transparent Scafkit terminal icon asset and kept the large preview image out of npm package contents.
- Polished the generated PHP layout with a window-bar header, full-screen first section, full-width details section, and improved footer.

### React and PERN

- Redesigned generated React and PERN starter UIs to better advertise Scafkit while keeping server and API status checks visible.
- Kept CSS and Tailwind variants aligned so each style option presents the same application structure.

### Documentation

- Expanded usage documentation for PHP, PERN, and React starter commands.

## 1.0.7

### Maintenance

- Pinned direct dependency versions for repeatable installs.
- Kept local publishing compatible by using public package access without local-only provenance enforcement.

## 1.0.6

### CLI

- Added persistent dev-server tracking so `status` and `stop` can still find Scafkit-started servers after reopening the CLI.
- Added `--session` and `-s` for generated PHP controllers that should include `SessionService` wiring.

### PHP

- Simplified the PHP starter to two generated pages: login and forgot password.
- Removed the generated reset password page, reset routes, reset controller, reset model, reset assets, and reset database table.
- Added login-attempt protection with a 5-attempt, 15-minute cooldown per email and IP address.
- Updated the generated login and forgot-password screens with a more polished, responsive app-style interface.

### React and PERN

- Updated generated React and PERN starter screens with a more production-style responsive UI and app-focused first screen.
- Refined starter copy to feel less like a demo page and more like an application workspace.

### Maintenance

- Added package engine metadata, package-manager metadata, production audit checks, and package dry-run checks.
- Expanded release checks so publishing validates syntax, audit status, and package contents.

## 1.0.5

### PHP

- Added `routes/web.php` and a small generated router for Laravel-like route editing.
- Added `scafkit make:route` to append routes and scaffold missing controller, model, and page view files.
- Updated route scaffolding so existing controllers are preserved and only missing action methods are added.
- Updated route-created page names to come from the route path, such as `/Hehe` creating `Hehe.php`.
- Added `App\Core\View` so generated PHP page files stay content-only while layouts are applied from one renderer.
- Skipped the shared layout wrapper for AJAX-style PHP view renders to keep partial responses clean.
- Redesigned generated PHP pages with a responsive Scafkit-branded interface across regular CSS, Bootstrap, and Tailwind modes.
- Added PHP starter `--tw` and `--bs` flags for Tailwind or Bootstrap layout assets.
- Improved generated PHP base-path handling for XAMPP subfolder projects.

### React and PERN

- Redesigned generated React and PERN client screens with a responsive Scafkit-branded interface for both regular CSS and Tailwind modes.
- Added richer starter panels, stack highlights, and useful demo/status surfaces while keeping the generated architecture intact.

### Maintenance

- Kept Socket.dev in the strict release maintenance path through `security:socket`, `security:strict`, and `prepublishOnly`.

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
