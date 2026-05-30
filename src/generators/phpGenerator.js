const fs = require('fs');
const path = require('path');

function ensureDirectory(directoryPath) {
  fs.mkdirSync(directoryPath, { recursive: true });
}

function writeTextFile(filePath, content, force, tracker) {
  ensureDirectory(path.dirname(filePath));

  if (fs.existsSync(filePath) && !force) {
    tracker.skipped.push(filePath);
    return;
  }

  fs.writeFileSync(filePath, content.replace(/\n/g, require('os').EOL), 'utf8');
  tracker.created.push(filePath);
}

function writeBinaryFile(filePath, buffer, force, tracker) {
  ensureDirectory(path.dirname(filePath));

  if (fs.existsSync(filePath) && !force) {
    tracker.skipped.push(filePath);
    return;
  }

  fs.writeFileSync(filePath, buffer);
  tracker.created.push(filePath);
}

function toControllerClassName(name) {
  const normalized = String(name || 'Example')
    .replace(/Controller$/i, '')
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');

  return (normalized || 'Example') + 'Controller';
}

function toPhpMethodName(name) {
  const parts = String(name || '')
    .replace(/^-+/, '')
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) {
    return null;
  }

  return parts
    .map((part, index) => {
      const clean = part.charAt(0).toUpperCase() + part.slice(1);
      return index === 0 ? clean.charAt(0).toLowerCase() + clean.slice(1) : clean;
    })
    .join('');
}

function createControllerTemplate(className, actions) {
  const uniqueActions = Array.from(new Set(['index', ...actions.map(toPhpMethodName).filter(Boolean)]));
  const methods = uniqueActions
    .map((action) => `    public function ${action}(): void
    {
        require dirname(__DIR__) . '/Views/Pages/${className.replace(/Controller$/, '')}.php';
    }`)
    .join('\n\n');

  return String.raw`<?php

namespace App\Controllers;

class ${className}
{
${methods}
}
`;
}

function generatePhpController({ targetDir, name, actions = [], force = false }) {
  if (!targetDir) {
    throw new Error('targetDir is required.');
  }

  const tracker = {
    targetDir,
    created: [],
    skipped: []
  };
  const controller = toControllerClassName(name);
  const filePath = path.join(targetDir, 'app/Controllers', controller + '.php');
  const normalizedActions = Array.from(new Set(['index', ...actions.map(toPhpMethodName).filter(Boolean)]));

  writeTextFile(filePath, createControllerTemplate(controller, normalizedActions), force, tracker);

  return {
    ...tracker,
    controller,
    actions: normalizedActions
  };
}

function generatePhpProject({ targetDir, force = false }) {
  if (!targetDir) {
    throw new Error('targetDir is required.');
  }

  ensureDirectory(targetDir);

  const tracker = {
    targetDir,
    created: [],
    skipped: []
  };

  const directories = [
    'app/Controllers',
    'app/Models',
    'app/Views/Pages',
    'app/Views/Components',
    'app/Views/Layouts',
    'app/Services',
    'config',
    'public/css',
    'public/js',
    'public/images',
    'public/uploads/profile_picture'
  ];

  for (const directory of directories) {
    ensureDirectory(path.join(targetDir, directory));
  }

  const files = {
    'app/Controllers/LoginController.php': String.raw`<?php

namespace App\Controllers;

use App\Models\LoginModel;
use App\Services\SessionService;

class LoginController
{
    private SessionService $sessionService;

    public function __construct()
    {
        $this->sessionService = new SessionService();
    }

    public function index(): void
    {
        require dirname(__DIR__) . '/Views/Pages/Login.php';
    }

    public function authenticate(): void
    {
        $email = filter_input(INPUT_POST, 'email', FILTER_VALIDATE_EMAIL);
        $password = $_POST['password'] ?? '';

        if (!$email || $password === '') {
            $this->sessionService->flash('error', 'Email and password are required.');
            $this->redirect('/');
        }

        $loginModel = new LoginModel();
        $user = $loginModel->findByEmail($email);

        if (!$user || !password_verify($password, $user['password'])) {
            $this->sessionService->flash('error', 'Invalid login credentials.');
            $this->redirect('/');
        }

        $this->sessionService->login([
            'id' => $user['id'],
            'name' => $user['name'],
            'email' => $user['email'],
        ]);

        $this->redirect('/');
    }

    private function redirect(string $path): void
    {
        header('Location: ' . BASE_URL . $path);
        exit;
    }
}
`,

    'app/Controllers/ForgotPassword.php': String.raw`<?php

namespace App\Controllers;

use App\Models\ForgotPasswordModel;
use App\Services\SessionService;

class ForgotPassword
{
    private SessionService $sessionService;

    public function __construct()
    {
        $this->sessionService = new SessionService();
    }

    public function index(): void
    {
        require dirname(__DIR__) . '/Views/Pages/ForgotPassword.php';
    }

    public function sendResetLink(): void
    {
        $email = filter_input(INPUT_POST, 'email', FILTER_VALIDATE_EMAIL);

        if (!$email) {
            $this->sessionService->flash('error', 'Enter a valid email address.');
            $this->redirect('/forgot-password');
        }

        $token = bin2hex(random_bytes(32));
        $forgotPasswordModel = new ForgotPasswordModel();
        $saved = $forgotPasswordModel->storeResetToken($email, $token);

        if (!$saved) {
            $this->sessionService->flash('error', 'Email address was not found.');
            $this->redirect('/forgot-password');
        }

        $resetUrl = BASE_URL . '/reset?token=' . urlencode($token);
        $this->sessionService->flash('success', 'Reset link generated: ' . $resetUrl);
        $this->redirect('/forgot-password');
    }

    private function redirect(string $path): void
    {
        header('Location: ' . BASE_URL . $path);
        exit;
    }
}
`,

    'app/Controllers/ResetPasswordController.php': String.raw`<?php

namespace App\Controllers;

use App\Models\ResetPasswordModel;
use App\Services\SessionService;

class ResetPasswordController
{
    private SessionService $sessionService;

    public function __construct()
    {
        $this->sessionService = new SessionService();
    }

    public function index(): void
    {
        require dirname(__DIR__) . '/Views/Pages/Reset.php';
    }

    public function update(): void
    {
        $token = $_POST['token'] ?? '';
        $password = $_POST['password'] ?? '';
        $confirmPassword = $_POST['confirm_password'] ?? '';

        if ($token === '' || $password === '' || $password !== $confirmPassword) {
            $this->sessionService->flash('error', 'Passwords must match.');
            $this->redirect('/reset?token=' . urlencode($token));
        }

        $resetPasswordModel = new ResetPasswordModel();
        $updated = $resetPasswordModel->resetPassword($token, password_hash($password, PASSWORD_DEFAULT));

        if (!$updated) {
            $this->sessionService->flash('error', 'Invalid or expired reset token.');
            $this->redirect('/reset?token=' . urlencode($token));
        }

        $this->sessionService->flash('success', 'Password updated. You may now sign in.');
        $this->redirect('/');
    }

    private function redirect(string $path): void
    {
        header('Location: ' . BASE_URL . $path);
        exit;
    }
}
`,

    'app/Controllers/SessionController.php': String.raw`<?php

namespace App\Controllers;

use App\Services\SessionService;

class SessionController
{
    private SessionService $sessionService;

    public function __construct()
    {
        $this->sessionService = new SessionService();
    }

    public function destroy(): void
    {
        $this->sessionService->logout();
        header('Location: ' . BASE_URL . '/');
        exit;
    }
}
`,

    'app/Models/DatabaseModel.php': String.raw`<?php

namespace App\Models;

use PDO;
use PDOException;

class DatabaseModel
{
    protected PDO $connection;

    public function __construct()
    {
        $host = $_ENV['DB_HOST'] ?? '127.0.0.1';
        $database = $_ENV['DB_NAME'] ?? 'scafkit_app';
        $username = $_ENV['DB_USER'] ?? 'root';
        $password = $_ENV['DB_PASS'] ?? '';
        $charset = $_ENV['DB_CHARSET'] ?? 'utf8mb4';

        $dsn = "mysql:host={$host};dbname={$database};charset={$charset}";

        try {
            $this->connection = new PDO($dsn, $username, $password, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ]);
        } catch (PDOException $exception) {
            throw new PDOException('Database connection failed: ' . $exception->getMessage());
        }
    }
}
`,

    'app/Models/LoginModel.php': String.raw`<?php

namespace App\Models;

class LoginModel extends DatabaseModel
{
    public function findByEmail(string $email): ?array
    {
        $statement = $this->connection->prepare('SELECT id, name, email, password FROM users WHERE email = :email LIMIT 1');
        $statement->execute(['email' => $email]);

        $user = $statement->fetch();
        return $user ?: null;
    }
}
`,

    'app/Models/ForgotPasswordModel.php': String.raw`<?php

namespace App\Models;

class ForgotPasswordModel extends DatabaseModel
{
    public function storeResetToken(string $email, string $token): bool
    {
        $userStatement = $this->connection->prepare('SELECT id FROM users WHERE email = :email LIMIT 1');
        $userStatement->execute(['email' => $email]);
        $user = $userStatement->fetch();

        if (!$user) {
            return false;
        }

        $deleteStatement = $this->connection->prepare('DELETE FROM password_resets WHERE user_id = :user_id');
        $deleteStatement->execute(['user_id' => $user['id']]);

        $insertStatement = $this->connection->prepare(
            'INSERT INTO password_resets (user_id, token, expires_at) VALUES (:user_id, :token, DATE_ADD(NOW(), INTERVAL 30 MINUTE))'
        );

        return $insertStatement->execute([
            'user_id' => $user['id'],
            'token' => hash('sha256', $token),
        ]);
    }
}
`,

    'app/Models/ResetPasswordModel.php': String.raw`<?php

namespace App\Models;

class ResetPasswordModel extends DatabaseModel
{
    public function resetPassword(string $token, string $hashedPassword): bool
    {
        $tokenHash = hash('sha256', $token);

        $statement = $this->connection->prepare(
            'SELECT user_id FROM password_resets WHERE token = :token AND expires_at > NOW() LIMIT 1'
        );
        $statement->execute(['token' => $tokenHash]);
        $resetRecord = $statement->fetch();

        if (!$resetRecord) {
            return false;
        }

        $updateStatement = $this->connection->prepare('UPDATE users SET password = :password WHERE id = :user_id');
        $updated = $updateStatement->execute([
            'password' => $hashedPassword,
            'user_id' => $resetRecord['user_id'],
        ]);

        if ($updated) {
            $deleteStatement = $this->connection->prepare('DELETE FROM password_resets WHERE user_id = :user_id');
            $deleteStatement->execute(['user_id' => $resetRecord['user_id']]);
        }

        return $updated;
    }
}
`,

    'app/Services/SessionService.php': String.raw`<?php

namespace App\Services;

class SessionService
{
    public function login(array $user): void
    {
        session_regenerate_id(true);
        $_SESSION['user'] = $user;
    }

    public function logout(): void
    {
        $_SESSION = [];

        if (ini_get('session.use_cookies')) {
            $params = session_get_cookie_params();
            setcookie(session_name(), '', time() - 42000, $params['path'], $params['domain'], $params['secure'], $params['httponly']);
        }

        session_destroy();
    }

    public function user(): ?array
    {
        return $_SESSION['user'] ?? null;
    }

    public function flash(string $key, string $message): void
    {
        $_SESSION['flash'][$key] = $message;
    }

    public function getFlash(string $key): ?string
    {
        $message = $_SESSION['flash'][$key] ?? null;
        unset($_SESSION['flash'][$key]);

        return $message;
    }
}
`,

    'app/Views/Layouts/Head.php': String.raw`<?php $meta = require dirname(__DIR__, 3) . '/config/meta.php'; ?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="<?= htmlspecialchars($meta['description']) ?>">
    <title><?= htmlspecialchars($title ?? $meta['title']) ?></title>
    <link rel="stylesheet" href="<?= BASE_URL ?>/css/login.css">
</head>
<body>
`,

    'app/Views/Layouts/Foot.php': String.raw`    <script src="<?= BASE_URL ?>/js/login.js"></script>
</body>
</html>
`,

    'app/Views/Components/Header.php': String.raw`<header class="site-header">
    <a class="site-brand" href="<?= BASE_URL ?>/"><?= htmlspecialchars(APP_NAME) ?></a>
</header>
`,

    'app/Views/Components/Footer.php': String.raw`<footer class="site-footer">
    <p>&copy; <?= date('Y') ?> <?= htmlspecialchars(APP_NAME) ?>. All rights reserved.</p>
</footer>
`,

    'app/Views/Components/Modal.php': String.raw`<div class="modal" id="appModal" hidden>
    <div class="modal__panel">
        <button class="modal__close" type="button" data-close-modal>&times;</button>
        <div class="modal__content" data-modal-content></div>
    </div>
</div>
`,

    'app/Views/Components/Sidebar.php': String.raw`<aside class="sidebar">
    <nav>
        <a href="<?= BASE_URL ?>/">Login</a>
        <a href="<?= BASE_URL ?>/forgot-password">Forgot Password</a>
    </nav>
</aside>
`,

    'app/Views/Components/Spinner.php': String.raw`<div class="spinner" data-spinner hidden>
    <span class="spinner__circle"></span>
    <span class="sr-only">Loading...</span>
</div>
`,

    'app/Views/Components/ToastMessage.php': String.raw`<?php
use App\Services\SessionService;

$sessionService = new SessionService();
$error = $sessionService->getFlash('error');
$success = $sessionService->getFlash('success');
?>

<?php if ($error): ?>
    <div class="toast toast--error"><?= htmlspecialchars($error) ?></div>
<?php endif; ?>

<?php if ($success): ?>
    <div class="toast toast--success"><?= htmlspecialchars($success) ?></div>
<?php endif; ?>
`,

    'app/Views/Pages/Login.php': String.raw`<?php $title = 'Login'; require dirname(__DIR__) . '/Layouts/Head.php'; ?>
<?php require dirname(__DIR__) . '/Components/Header.php'; ?>
<?php require dirname(__DIR__) . '/Components/ToastMessage.php'; ?>

<main class="auth-page">
    <section class="auth-card">
        <h1>Welcome back</h1>
        <p>Sign in to continue.</p>

        <form method="POST" action="<?= BASE_URL ?>/login" class="auth-form">
            <label>
                Email
                <input type="email" name="email" autocomplete="email" required>
            </label>

            <label>
                Password
                <input type="password" name="password" autocomplete="current-password" required>
            </label>

            <button type="submit">Login</button>
        </form>

        <a href="<?= BASE_URL ?>/forgot-password">Forgot password?</a>
    </section>
</main>

<?php require dirname(__DIR__) . '/Components/Footer.php'; ?>
<?php require dirname(__DIR__) . '/Layouts/Foot.php'; ?>
`,

    'app/Views/Pages/ForgotPassword.php': String.raw`<?php $title = 'Forgot Password'; require dirname(__DIR__) . '/Layouts/Head.php'; ?>
<?php require dirname(__DIR__) . '/Components/Header.php'; ?>
<?php require dirname(__DIR__) . '/Components/ToastMessage.php'; ?>

<main class="auth-page">
    <section class="auth-card">
        <h1>Forgot password</h1>
        <p>Enter your email address to generate a reset link.</p>

        <form method="POST" action="<?= BASE_URL ?>/forgot-password" class="auth-form">
            <label>
                Email
                <input type="email" name="email" autocomplete="email" required>
            </label>

            <button type="submit">Generate reset link</button>
        </form>

        <a href="<?= BASE_URL ?>/">Back to login</a>
    </section>
</main>

<?php require dirname(__DIR__) . '/Components/Footer.php'; ?>
<?php require dirname(__DIR__) . '/Layouts/Foot.php'; ?>
`,

    'app/Views/Pages/Reset.php': String.raw`<?php $title = 'Reset Password'; require dirname(__DIR__) . '/Layouts/Head.php'; ?>
<?php require dirname(__DIR__) . '/Components/Header.php'; ?>
<?php require dirname(__DIR__) . '/Components/ToastMessage.php'; ?>

<main class="auth-page">
    <section class="auth-card">
        <h1>Reset password</h1>
        <p>Create a new password for your account.</p>

        <form method="POST" action="<?= BASE_URL ?>/reset" class="auth-form">
            <input type="hidden" name="token" value="<?= htmlspecialchars($_GET['token'] ?? '') ?>">

            <label>
                New password
                <input type="password" name="password" autocomplete="new-password" required>
            </label>

            <label>
                Confirm password
                <input type="password" name="confirm_password" autocomplete="new-password" required>
            </label>

            <button type="submit">Update password</button>
        </form>
    </section>
</main>

<?php require dirname(__DIR__) . '/Components/Footer.php'; ?>
<?php require dirname(__DIR__) . '/Layouts/Foot.php'; ?>
`,

    'config/autoload.php': String.raw`<?php

spl_autoload_register(function (string $class): void {
    $prefix = 'App\\';
    $baseDirectory = dirname(__DIR__) . '/app/';

    $prefixLength = strlen($prefix);

    if (strncmp($prefix, $class, $prefixLength) !== 0) {
        return;
    }

    $relativeClass = substr($class, $prefixLength);
    $file = $baseDirectory . str_replace('\\', '/', $relativeClass) . '.php';

    if (file_exists($file)) {
        require $file;
    }
});

$envPath = dirname(__DIR__) . '/.env';

if (file_exists($envPath)) {
    $lines = file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);

    foreach ($lines as $line) {
        $line = trim($line);

        if ($line === '' || str_starts_with($line, '#')) {
            continue;
        }

        [$key, $value] = array_pad(explode('=', $line, 2), 2, '');
        $_ENV[trim($key)] = trim($value, " \t\n\r\0\x0B\"'");
    }
}
`,

    'config/config.php': String.raw`<?php

define('APP_NAME', $_ENV['APP_NAME'] ?? 'Scafkit PHP App');
define('APP_ENV', $_ENV['APP_ENV'] ?? 'local');
define('APP_DEBUG', filter_var($_ENV['APP_DEBUG'] ?? true, FILTER_VALIDATE_BOOLEAN));
define('BASE_URL', rtrim($_ENV['BASE_URL'] ?? 'http://localhost:8000', '/'));

if (APP_DEBUG) {
    ini_set('display_errors', '1');
    ini_set('display_startup_errors', '1');
    error_reporting(E_ALL);
}
`,

    'config/meta.php': String.raw`<?php

return [
    'title' => $_ENV['APP_NAME'] ?? 'Scafkit PHP App',
    'description' => 'PHP MVC authentication starter generated by Scafkit.',
];
`,

    'config/session.php': String.raw`<?php

$secure = filter_var($_ENV['SESSION_SECURE'] ?? false, FILTER_VALIDATE_BOOLEAN);

session_name($_ENV['SESSION_NAME'] ?? 'SCAFKIT_SESSION');
session_set_cookie_params([
    'lifetime' => 0,
    'path' => '/',
    'domain' => '',
    'secure' => $secure,
    'httponly' => true,
    'samesite' => 'Lax',
]);

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
`,

    'public/index.php': String.raw`<?php

require dirname(__DIR__) . '/config/autoload.php';
require dirname(__DIR__) . '/config/config.php';
require dirname(__DIR__) . '/config/session.php';

use App\Controllers\ForgotPassword;
use App\Controllers\LoginController;
use App\Controllers\ResetPasswordController;
use App\Controllers\SessionController;

$path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$basePath = parse_url(BASE_URL, PHP_URL_PATH) ?: '';

if ($basePath !== '' && str_starts_with($path, $basePath)) {
    $path = substr($path, strlen($basePath)) ?: '/';
}

$route = rtrim($path, '/') ?: '/';

try {
    match ([$method, $route]) {
        ['GET', '/'] => (new LoginController())->index(),
        ['POST', '/login'] => (new LoginController())->authenticate(),
        ['GET', '/forgot-password'] => (new ForgotPassword())->index(),
        ['POST', '/forgot-password'] => (new ForgotPassword())->sendResetLink(),
        ['GET', '/reset'] => (new ResetPasswordController())->index(),
        ['POST', '/reset'] => (new ResetPasswordController())->update(),
        ['POST', '/logout'] => (new SessionController())->destroy(),
        default => notFound(),
    };
} catch (Throwable $throwable) {
    http_response_code(500);
    echo APP_DEBUG ? $throwable->getMessage() : 'Internal Server Error';
}

function notFound(): void
{
    http_response_code(404);
    echo '404 | Page not found';
}
`,

    'public/.htaccess': String.raw`RewriteEngine On

RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^ index.php [QSA,L]
`,

    '.htaccess': String.raw`RewriteEngine On

RewriteRule ^$ public/ [L]
RewriteRule (.*) public/$1 [L]
`,

    'public/css/login.css': String.raw`:root {
    color-scheme: light;
    --background: #f8fafc;
    --card: #ffffff;
    --text: #0f172a;
    --muted: #64748b;
    --border: #e2e8f0;
    --primary: #2563eb;
    --primary-hover: #1d4ed8;
    --error: #dc2626;
    --success: #16a34a;
}

* {
    box-sizing: border-box;
}

body {
    margin: 0;
    min-height: 100vh;
    font-family: Arial, sans-serif;
    background: var(--background);
    color: var(--text);
}

.site-header,
.site-footer {
    padding: 1rem 1.5rem;
    text-align: center;
}

.site-brand {
    color: var(--text);
    font-weight: 700;
    text-decoration: none;
}

.auth-page {
    display: grid;
    min-height: 75vh;
    place-items: center;
    padding: 1rem;
}

.auth-card {
    width: min(100%, 420px);
    padding: 2rem;
    border: 1px solid var(--border);
    border-radius: 1rem;
    background: var(--card);
    box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
}

.auth-card h1 {
    margin: 0 0 0.5rem;
}

.auth-card p {
    margin-top: 0;
    color: var(--muted);
}

.auth-form {
    display: grid;
    gap: 1rem;
}

.auth-form label {
    display: grid;
    gap: 0.375rem;
    font-weight: 600;
}

.auth-form input {
    width: 100%;
    padding: 0.75rem 0.875rem;
    border: 1px solid var(--border);
    border-radius: 0.625rem;
    font: inherit;
}

.auth-form button {
    cursor: pointer;
    border: 0;
    border-radius: 0.625rem;
    padding: 0.875rem 1rem;
    background: var(--primary);
    color: white;
    font-weight: 700;
}

.auth-form button:hover {
    background: var(--primary-hover);
}

.toast {
    width: min(100% - 2rem, 620px);
    margin: 1rem auto;
    padding: 0.875rem 1rem;
    border-radius: 0.75rem;
    color: white;
}

.toast--error {
    background: var(--error);
}

.toast--success {
    background: var(--success);
}

.spinner__circle {
    display: inline-block;
    width: 1rem;
    height: 1rem;
    border: 2px solid currentColor;
    border-right-color: transparent;
    border-radius: 999px;
    animation: spin 0.7s linear infinite;
}

.sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}
`,

    'public/css/forgot_password.css': String.raw`@import url('./login.css');
`,

    'public/css/reset.css': String.raw`@import url('./login.css');
`,

    'public/js/login.js': String.raw`document.addEventListener('DOMContentLoaded', () => {
    const forms = document.querySelectorAll('form');

    forms.forEach((form) => {
        form.addEventListener('submit', () => {
            const submitButton = form.querySelector('button[type="submit"]');

            if (submitButton) {
                submitButton.disabled = true;
                submitButton.textContent = 'Please wait...';
            }
        });
    });
});
`,

    'public/js/forgot_password.js': String.raw`document.addEventListener('DOMContentLoaded', () => {
    console.log('Forgot password page loaded.');
});
`,

    'public/js/reset.js': String.raw`document.addEventListener('DOMContentLoaded', () => {
    console.log('Reset password page loaded.');
});
`,

    '.env.example': String.raw`APP_NAME="Scafkit PHP App"
APP_ENV=local
APP_DEBUG=true
BASE_URL=http://localhost:8000

DB_HOST=127.0.0.1
DB_NAME=scafkit_app
DB_USER=root
DB_PASS=
DB_CHARSET=utf8mb4

SESSION_NAME=SCAFKIT_SESSION
SESSION_SECURE=false
`,

    '.gitignore': String.raw`.env
/vendor
/node_modules
.DS_Store
Thumbs.db
public/uploads/*
!public/uploads/profile_picture/
!public/uploads/profile_picture/default.avif
`,

    'database.sql': String.raw`CREATE DATABASE IF NOT EXISTS scafkit_app CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE scafkit_app;

CREATE TABLE IF NOT EXISTS users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(180) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    profile_picture VARCHAR(255) DEFAULT 'default.avif',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS password_resets (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    token VARCHAR(64) NOT NULL UNIQUE,
    expires_at DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT password_resets_user_id_foreign
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE
);

INSERT INTO users (name, email, password)
VALUES (
    'Demo User',
    'demo@example.com',
    '$2y$12$IjhQ/FbDcJeJK.TdbwnpOe2ioKr.DMWF7.dJQMCqsMRfsqNEwgkvO'
)
ON DUPLICATE KEY UPDATE email = email;
`,
  };

  for (const [relativePath, content] of Object.entries(files)) {
    writeTextFile(path.join(targetDir, relativePath), content, force, tracker);
  }

  writeBinaryFile(path.join(targetDir, 'public/uploads/profile_picture/default.avif'), Buffer.alloc(0), force, tracker);

  return tracker;
}

module.exports = {
  generatePhpProject,
  generatePhpController
};
