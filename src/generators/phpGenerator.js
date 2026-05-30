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

function normalizeLineEndings(content) {
  return String(content).replace(/\r\n/g, '\n').replace(/\r/g, '\n');
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

function toModelClassName(controllerName) {
  const baseName = String(controllerName || 'Example')
    .replace(/Controller$/i, '')
    .replace(/Model$/i, '');

  return toControllerClassName(baseName).replace(/Controller$/, 'Model');
}

function toViewPageName(controllerName, actionName = 'index') {
  const baseName = String(controllerName || 'Example').replace(/Controller$/i, '');
  const action = toPhpMethodName(actionName) || 'index';

  if (action === 'index') {
    return baseName;
  }

  return baseName + action.charAt(0).toUpperCase() + action.slice(1);
}

function toViewPageNameFromRoute(routePath) {
  const normalized = normalizePhpRoutePath(routePath);
  const segment = normalized
    .split('/')
    .filter(Boolean)
    .pop() || 'Home';
  const pageName = String(segment)
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');

  return pageName || 'Home';
}

function toPageTitle(pageName) {
  return String(pageName || 'Page').replace(/([a-z])([A-Z])/g, '$1 $2');
}

function createControllerMethod(actionName, viewPageName) {
  const title = toPageTitle(viewPageName);

  return `    public function ${actionName}(): void
    {
        \\App\\Core\\View::render('${viewPageName}', '${title}');
    }`;
}

function createControllerTemplate(className, actions) {
  const uniqueActions = Array.from(new Set(['index', ...actions.map(toPhpMethodName).filter(Boolean)]));
  const methods = uniqueActions
    .map((action) => createControllerMethod(action, toViewPageName(className, action)))
    .join('\n\n');

  return String.raw`<?php

namespace App\Controllers;

class ${className}
{
${methods}
}
`;
}

function createRouteControllerTemplate(className, actionName, viewPageName) {
  const action = toPhpMethodName(actionName) || 'index';
  const page = viewPageName || toViewPageName(className, action);

  return String.raw`<?php

namespace App\Controllers;

class ${className}
{
${createControllerMethod(action, page)}
}
`;
}

function createModelTemplate(className) {
  return String.raw`<?php

namespace App\Models;

class ${className} extends DatabaseModel
{
}
`;
}

function createViewTemplate(pageName) {
  const title = toPageTitle(pageName);

  return String.raw`<main class="scafkit-page">
    <section class="scafkit-hero">
        <div class="scafkit-hero__content">
            <span class="scafkit-kicker">Scafkit PHP MVC</span>
            <h1>${title}</h1>
            <p>Generated as a clean page module with routing, controller, model, and view conventions already in place.</p>
        </div>
        <div class="scafkit-command">
            <span>route</span>
            <strong><?= htmlspecialchars($_SERVER['REQUEST_URI'] ?? '/') ?></strong>
        </div>
    </section>

    <section class="scafkit-grid" aria-label="Generated page details">
        <article class="scafkit-card">
            <span>01</span>
            <h2>Controller Ready</h2>
            <p>This page is rendered through its controller action, so business logic stays out of the view.</p>
        </article>
        <article class="scafkit-card">
            <span>02</span>
            <h2>Model Slot</h2>
            <p>A paired model file is available for database work when this screen grows into a real feature.</p>
        </article>
        <article class="scafkit-card">
            <span>03</span>
            <h2>Responsive View</h2>
            <p>The same Scafkit interface adapts across regular CSS, Bootstrap, and Tailwind starter modes.</p>
        </article>
    </section>
</main>
`;
}

function controllerHasMethod(content, methodName) {
  return new RegExp(`function\\s+${methodName}\\s*\\(`).test(content);
}

function addMethodToController(filePath, methodName, viewPageName, tracker) {
  let content = normalizeLineEndings(fs.readFileSync(filePath, 'utf8'));

  if (controllerHasMethod(content, methodName)) {
    tracker.skipped.push(filePath);
    return false;
  }

  const methodBlock = createControllerMethod(methodName, viewPageName);
  const lastBraceIndex = content.lastIndexOf('}');

  if (lastBraceIndex === -1) {
    tracker.skipped.push(filePath);
    return false;
  }

  const before = content.slice(0, lastBraceIndex).trimEnd();
  const after = content.slice(lastBraceIndex);
  content = `${before}\n\n${methodBlock}\n${after}`;

  fs.writeFileSync(filePath, content.replace(/\n/g, require('os').EOL), 'utf8');
  tracker.created.push(filePath);
  return true;
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

function normalizePhpRoutePath(routePath) {
  const normalized = String(routePath || '/').trim();

  if (normalized === '') {
    return '/';
  }

  return '/' + normalized.replace(/^\/+/, '').replace(/\/+$/, '');
}

function normalizeHttpMethod(method) {
  const normalized = String(method || 'GET').trim().toUpperCase();
  const allowed = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

  return allowed.includes(normalized) ? normalized : 'GET';
}

function parseRouteHandler(handler) {
  const value = String(handler || '').trim();
  const [controllerName, actionName = 'index'] = value
    .replace(/::/, '@')
    .split('@')
    .map((part) => part.trim());

  if (!controllerName) {
    throw new Error('Route handler is required. Use ControllerName@method.');
  }

  return {
    controller: toControllerClassName(controllerName),
    action: toPhpMethodName(actionName) || 'index'
  };
}

function createRouteLine(method, routePath, handler) {
  const parsedHandler = parseRouteHandler(handler);
  const methodName = normalizeHttpMethod(method).toLowerCase();

  return `$router->${methodName}('${normalizePhpRoutePath(routePath)}', [${parsedHandler.controller}::class, '${parsedHandler.action}']);`;
}

function ensureRouteUseStatement(content, controller) {
  const useLine = `use App\\Controllers\\${controller};`;

  if (content.includes(useLine)) {
    return content;
  }

  const namespaceUses = content.match(/^use App\\Controllers\\[^;]+;$/gm) || [];
  if (namespaceUses.length > 0) {
    const lastUse = namespaceUses[namespaceUses.length - 1];
    return content.replace(lastUse, `${lastUse}\n${useLine}`);
  }

  return content.replace('<?php\n', `<?php\n\n${useLine}\n`);
}

function generatePhpRoute({ targetDir, routePath, handler, method = 'GET', force = false }) {
  if (!targetDir) {
    throw new Error('targetDir is required.');
  }

  const tracker = {
    targetDir,
    created: [],
    skipped: []
  };
  const routeFile = path.join(targetDir, 'routes/web.php');
  const parsedHandler = parseRouteHandler(handler);
  const routeLine = createRouteLine(method, routePath, handler);
  const normalizedRoute = normalizePhpRoutePath(routePath);
  const normalizedMethod = normalizeHttpMethod(method);
  const controllerFile = path.join(targetDir, 'app/Controllers', parsedHandler.controller + '.php');
  const model = toModelClassName(parsedHandler.controller);
  const modelFile = path.join(targetDir, 'app/Models', model + '.php');
  const viewPage = toViewPageNameFromRoute(normalizedRoute);
  const viewFile = path.join(targetDir, 'app/Views/Pages', viewPage + '.php');

  if (!fs.existsSync(routeFile)) {
    writeTextFile(routeFile, createRoutesTemplate(), false, tracker);
  }

  let content = normalizeLineEndings(fs.readFileSync(routeFile, 'utf8'));

  if (content.includes(routeLine)) {
    tracker.skipped.push(routeFile);
  } else {
    content = ensureRouteUseStatement(content, parsedHandler.controller);
    const insertion = `${routeLine}\n`;
    const routePattern = new RegExp(`\\$router->${normalizedMethod.toLowerCase()}\\('${normalizedRoute.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}'\\s*,\\s*\\[[^;]+;`);

    if (force && routePattern.test(content)) {
      content = content.replace(routePattern, routeLine);
    } else if (content.includes('return $router;')) {
      content = content.replace(/return \$router;\s*$/m, `${insertion}\nreturn $router;`);
    } else {
      content = `${content.trimEnd()}\n\n${insertion}`;
    }

    fs.writeFileSync(routeFile, content.replace(/\n/g, require('os').EOL), 'utf8');
    if (!tracker.created.includes(routeFile)) {
      tracker.created.push(routeFile);
    }
  }

  if (fs.existsSync(controllerFile)) {
    addMethodToController(controllerFile, parsedHandler.action, viewPage, tracker);
  } else {
    writeTextFile(
      controllerFile,
      createRouteControllerTemplate(parsedHandler.controller, parsedHandler.action, viewPage),
      false,
      tracker,
    );
  }

  if (fs.existsSync(modelFile)) {
    if (force) {
      writeTextFile(modelFile, createModelTemplate(model), true, tracker);
    } else {
      tracker.skipped.push(modelFile);
    }
  } else {
    writeTextFile(modelFile, createModelTemplate(model), force, tracker);
  }

  if (fs.existsSync(viewFile)) {
    if (force) {
      writeTextFile(viewFile, createViewTemplate(viewPage), true, tracker);
    } else {
      tracker.skipped.push(viewFile);
    }
  } else {
    writeTextFile(viewFile, createViewTemplate(viewPage), force, tracker);
  }

  return {
    ...tracker,
    route: normalizedRoute,
    method: normalizedMethod,
    handler: `${parsedHandler.controller}@${parsedHandler.action}`,
    controller: parsedHandler.controller,
    model,
    view: viewPage
  };
}

function normalizePhpCssFramework(cssFramework) {
  const normalized = String(cssFramework || 'css').toLowerCase();

  return ['css', 'tailwind', 'bootstrap'].includes(normalized) ? normalized : 'css';
}

function createPhpHeadTemplate(cssFramework = 'css') {
  const framework = normalizePhpCssFramework(cssFramework);
  const frameworkAssets = {
    css: '',
    tailwind: '    <script src="https://cdn.tailwindcss.com"></script>\n',
    bootstrap: '    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">\n'
  };

  return String.raw`<?php $meta = require dirname(__DIR__, 3) . '/config/meta.php'; ?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="<?= htmlspecialchars($meta['description']) ?>">
    <title><?= htmlspecialchars($title ?? $meta['title']) ?></title>
${frameworkAssets[framework]}    <link rel="stylesheet" href="<?= BASE_URL ?>/css/login.css">
</head>
<body data-css-framework="${framework}">
`;
}

function createPhpFootTemplate(cssFramework = 'css') {
  const framework = normalizePhpCssFramework(cssFramework);
  const bootstrapScript = framework === 'bootstrap'
    ? '    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>\n'
    : '';

  return String.raw`${bootstrapScript}    <script src="<?= BASE_URL ?>/js/login.js"></script>
</body>
</html>
`;
}

function createRoutesTemplate() {
  return String.raw`<?php

use App\Controllers\ForgotPassword;
use App\Controllers\LoginController;
use App\Controllers\ResetPasswordController;
use App\Controllers\SessionController;
use App\Core\Router;

/** @var Router $router */

$router->get('/', [LoginController::class, 'index']);
$router->post('/login', [LoginController::class, 'authenticate']);
$router->get('/forgot-password', [ForgotPassword::class, 'index']);
$router->post('/forgot-password', [ForgotPassword::class, 'sendResetLink']);
$router->get('/reset', [ResetPasswordController::class, 'index']);
$router->post('/reset', [ResetPasswordController::class, 'update']);
$router->post('/logout', [SessionController::class, 'destroy']);

return $router;
`;
}

function generatePhpProject({ targetDir, force = false, cssFramework = 'css' }) {
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
    'app/Core',
    'app/Controllers',
    'app/Models',
    'app/Views/Pages',
    'app/Views/Components',
    'app/Views/Layouts',
    'app/Services',
    'config',
    'routes',
    'public/css',
    'public/js',
    'public/images',
    'public/uploads/profile_picture'
  ];

  for (const directory of directories) {
    ensureDirectory(path.join(targetDir, directory));
  }

  const files = {
    'app/Core/Router.php': String.raw`<?php

namespace App\Core;

class Router
{
    private array $routes = [];

    public function get(string $path, callable|array $handler): void
    {
        $this->add('GET', $path, $handler);
    }

    public function post(string $path, callable|array $handler): void
    {
        $this->add('POST', $path, $handler);
    }

    public function put(string $path, callable|array $handler): void
    {
        $this->add('PUT', $path, $handler);
    }

    public function patch(string $path, callable|array $handler): void
    {
        $this->add('PATCH', $path, $handler);
    }

    public function delete(string $path, callable|array $handler): void
    {
        $this->add('DELETE', $path, $handler);
    }

    public function dispatch(string $method, string $path): void
    {
        $method = strtoupper($method);
        $path = $this->normalizePath($path);
        $handler = $this->routes[$method][$path] ?? null;

        if (!$handler) {
            $this->notFound();
            return;
        }

        $this->runHandler($handler);
    }

    private function add(string $method, string $path, callable|array $handler): void
    {
        $this->routes[strtoupper($method)][$this->normalizePath($path)] = $handler;
    }

    private function normalizePath(string $path): string
    {
        $path = '/' . trim($path, '/');
        return $path === '/' ? '/' : rtrim($path, '/');
    }

    private function runHandler(callable|array $handler): void
    {
        if (is_array($handler) && is_string($handler[0] ?? null)) {
            $controller = new $handler[0]();
            $action = $handler[1] ?? 'index';
            $controller->{$action}();
            return;
        }

        call_user_func($handler);
    }

    private function notFound(): void
    {
        http_response_code(404);
        echo '404 | Page not found';
    }
}
`,

    'app/Core/View.php': String.raw`<?php

namespace App\Core;

class View
{
    public static function render(string $page, ?string $title = null, array $data = []): void
    {
        $viewPath = dirname(__DIR__) . '/Views/Pages/' . trim($page, '/') . '.php';

        if (!file_exists($viewPath)) {
            http_response_code(404);
            echo 'View not found';
            return;
        }

        extract($data, EXTR_SKIP);

        if (self::isAjaxRequest()) {
            require $viewPath;
            return;
        }

        require dirname(__DIR__) . '/Views/Layouts/Head.php';
        require dirname(__DIR__) . '/Views/Components/Header.php';
        require dirname(__DIR__) . '/Views/Components/ToastMessage.php';
        require $viewPath;
        require dirname(__DIR__) . '/Views/Components/Footer.php';
        require dirname(__DIR__) . '/Views/Layouts/Foot.php';
    }

    private static function isAjaxRequest(): bool
    {
        $requestedWith = strtolower($_SERVER['HTTP_X_REQUESTED_WITH'] ?? '');
        $accept = strtolower($_SERVER['HTTP_ACCEPT'] ?? '');

        return $requestedWith === 'xmlhttprequest' || str_contains($accept, 'application/json');
    }
}
`,

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
        \App\Core\View::render('Login', 'Login');
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
        \App\Core\View::render('ForgotPassword', 'Forgot Password');
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
        \App\Core\View::render('Reset', 'Reset Password');
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

    'app/Views/Layouts/Head.php': createPhpHeadTemplate(cssFramework),

    'app/Views/Layouts/Foot.php': createPhpFootTemplate(cssFramework),

    'app/Views/Components/Header.php': String.raw`<header class="site-header">
    <a class="site-brand" href="<?= BASE_URL ?>/">
        <span class="site-brand__mark">S</span>
        <span><?= htmlspecialchars(APP_NAME) ?></span>
    </a>
    <nav class="site-nav" aria-label="Primary">
        <a href="<?= BASE_URL ?>/">Login</a>
        <a href="<?= BASE_URL ?>/forgot-password">Recover</a>
    </nav>
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

    'app/Views/Pages/Login.php': String.raw`<main class="auth-page">
    <section class="auth-intro">
        <span class="scafkit-kicker">Scafkit PHP MVC</span>
        <h1>Ship a clean PHP auth flow without wrestling the folder structure.</h1>
        <p>Controllers, models, routes, views, sessions, and database defaults are already arranged so you can start building the real product.</p>
        <div class="scafkit-metrics" aria-label="Starter highlights">
            <span><strong>MVC</strong> structure</span>
            <span><strong>XAMPP</strong> ready</span>
            <span><strong>Routes</strong> editable</span>
        </div>
    </section>

    <section class="auth-card">
        <span class="scafkit-kicker">Secure entry</span>
        <h2>Welcome back</h2>
        <p>Sign in to continue to your Scafkit workspace.</p>

        <form method="POST" action="<?= BASE_URL ?>/login" class="auth-form">
            <label>
                Email
                <input type="email" name="email" autocomplete="email" required>
            </label>

            <label>
                Password
                <input type="password" name="password" autocomplete="current-password" required>
            </label>

            <button type="submit">Login to starter</button>
        </form>

        <a href="<?= BASE_URL ?>/forgot-password">Forgot password?</a>
    </section>
</main>
`,

    'app/Views/Pages/ForgotPassword.php': String.raw`<main class="auth-page auth-page--compact">
    <section class="auth-card">
        <span class="scafkit-kicker">Account recovery</span>
        <h1>Reset access with a clean PHP flow.</h1>
        <p>Generate a reset link using the starter's model, controller, session flash, and route conventions.</p>

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
`,

    'app/Views/Pages/Reset.php': String.raw`<main class="auth-page auth-page--compact">
    <section class="auth-card">
        <span class="scafkit-kicker">Password reset</span>
        <h1>Create a new password.</h1>
        <p>Finish the reset flow with a focused generated screen that keeps form logic in the controller.</p>

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

function app_base_path(): string
{
    $scriptName = str_replace('\\', '/', $_SERVER['SCRIPT_NAME'] ?? '');
    $scriptDirectory = rtrim(str_replace('\\', '/', dirname($scriptName)), '/');

    if ($scriptDirectory === '' || $scriptDirectory === '.') {
        return '';
    }

    if (str_ends_with($scriptDirectory, '/public')) {
        $scriptDirectory = substr($scriptDirectory, 0, -strlen('/public'));
    }

    return $scriptDirectory === '/' ? '' : $scriptDirectory;
}

function app_base_url(string $basePath): string
{
    $https = $_SERVER['HTTPS'] ?? '';
    $scheme = ($https !== '' && $https !== 'off') ? 'https' : 'http';
    $host = $_SERVER['HTTP_HOST'] ?? 'localhost';

    return $scheme . '://' . $host . $basePath;
}

define('APP_NAME', $_ENV['APP_NAME'] ?? 'Scafkit PHP App');
define('APP_ENV', $_ENV['APP_ENV'] ?? 'local');
define('APP_DEBUG', filter_var($_ENV['APP_DEBUG'] ?? true, FILTER_VALIDATE_BOOLEAN));

$detectedBasePath = app_base_path();
$configuredBaseUrl = trim($_ENV['BASE_URL'] ?? '');

if ($configuredBaseUrl === '' || ($configuredBaseUrl === 'http://localhost:8000' && ($_SERVER['HTTP_HOST'] ?? '') !== 'localhost:8000')) {
    $configuredBaseUrl = app_base_url($detectedBasePath);
}

define('BASE_PATH', rtrim(parse_url($configuredBaseUrl, PHP_URL_PATH) ?: $detectedBasePath, '/'));
define('BASE_URL', rtrim($configuredBaseUrl, '/'));

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
    'path' => BASE_PATH === '' ? '/' : BASE_PATH,
    'domain' => '',
    'secure' => $secure,
    'httponly' => true,
    'samesite' => 'Lax',
]);

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
`,

    'routes/web.php': createRoutesTemplate(),

    'public/index.php': String.raw`<?php

require dirname(__DIR__) . '/config/autoload.php';
require dirname(__DIR__) . '/config/config.php';
require dirname(__DIR__) . '/config/session.php';

use App\Core\Router;

$path = rtrim(parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/', '/') ?: '/';
$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$basePath = rtrim(BASE_PATH, '/');

if ($basePath !== '' && ($path === $basePath || str_starts_with($path, $basePath . '/'))) {
    $path = substr($path, strlen($basePath)) ?: '/';
}

$route = rtrim($path, '/') ?: '/';

try {
    $router = new Router();
    require dirname(__DIR__) . '/routes/web.php';
    $router->dispatch($method, $route);
} catch (Throwable $throwable) {
    http_response_code(500);
    echo APP_DEBUG ? $throwable->getMessage() : 'Internal Server Error';
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
    color-scheme: dark;
    --bg: #07111f;
    --surface: #0e1a2d;
    --surface-strong: #12233b;
    --card: rgba(12, 28, 48, 0.92);
    --text: #eff6ff;
    --muted: #a8bed8;
    --line: rgba(125, 211, 252, 0.22);
    --cyan: #22d3ee;
    --blue: #38bdf8;
    --gold: #facc15;
    --error: #ef4444;
    --success: #22c55e;
}

* {
    box-sizing: border-box;
}

body {
    margin: 0;
    min-height: 100vh;
    font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    background:
        radial-gradient(circle at top left, rgba(34, 211, 238, 0.22), transparent 32rem),
        radial-gradient(circle at bottom right, rgba(250, 204, 21, 0.12), transparent 28rem),
        linear-gradient(135deg, #07111f 0%, #0c1727 54%, #08111f 100%);
    color: var(--text);
}

a {
    color: var(--cyan);
}

.site-header,
.site-footer {
    width: min(1180px, calc(100% - 2rem));
    margin: 0 auto;
}

.site-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 1.25rem 0;
}

.site-footer {
    padding: 1rem 0 2rem;
    color: var(--muted);
    font-size: 0.92rem;
}

.site-brand,
.site-nav {
    display: inline-flex;
    align-items: center;
    gap: 0.75rem;
}

.site-brand {
    color: var(--text);
    font-weight: 800;
    text-decoration: none;
}

.site-brand__mark {
    display: grid;
    width: 2.35rem;
    height: 2.35rem;
    place-items: center;
    border: 1px solid var(--line);
    border-radius: 8px;
    background: linear-gradient(135deg, rgba(34, 211, 238, 0.18), rgba(250, 204, 21, 0.16));
    color: var(--gold);
}

.site-nav a {
    color: var(--muted);
    font-size: 0.92rem;
    font-weight: 700;
    text-decoration: none;
}

.site-nav a:hover {
    color: var(--text);
}

.scafkit-kicker {
    display: inline-flex;
    width: fit-content;
    align-items: center;
    gap: 0.45rem;
    border: 1px solid var(--line);
    border-radius: 999px;
    padding: 0.35rem 0.7rem;
    background: rgba(34, 211, 238, 0.1);
    color: var(--gold);
    font-size: 0.74rem;
    font-weight: 900;
    text-transform: uppercase;
}

.auth-page,
.scafkit-page {
    width: min(1180px, calc(100% - 2rem));
    margin: 0 auto;
    padding: clamp(1.5rem, 4vw, 4rem) 0;
}

.auth-page {
    display: grid;
    min-height: 78vh;
    grid-template-columns: minmax(0, 1.15fr) minmax(320px, 430px);
    gap: clamp(1rem, 4vw, 3rem);
    align-items: center;
}

.auth-page--compact {
    grid-template-columns: minmax(320px, 520px);
    justify-content: center;
}

.auth-intro,
.auth-card,
.scafkit-hero,
.scafkit-card {
    border: 1px solid var(--line);
    border-radius: 8px;
    background: var(--card);
    box-shadow: 0 24px 90px rgba(0, 0, 0, 0.34);
}

.auth-intro,
.auth-card {
    padding: clamp(1.35rem, 4vw, 3rem);
}

.auth-intro h1,
.scafkit-hero h1 {
    margin: 1rem 0;
    max-width: 760px;
    font-size: clamp(2rem, 6vw, 4.8rem);
    line-height: 0.98;
}

.auth-intro p,
.scafkit-hero p,
.auth-card p,
.scafkit-card p {
    color: var(--muted);
    line-height: 1.75;
}

.scafkit-metrics {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0.75rem;
    margin-top: 1.5rem;
}

.scafkit-metrics span,
.scafkit-command {
    border: 1px solid var(--line);
    border-radius: 8px;
    background: rgba(7, 17, 31, 0.72);
    padding: 0.85rem;
    color: var(--muted);
}

.scafkit-metrics strong {
    display: block;
    color: var(--text);
}

.auth-card h1,
.auth-card h2 {
    margin: 0.85rem 0 0.5rem;
    font-size: clamp(1.75rem, 4vw, 2.45rem);
}

.auth-form {
    display: grid;
    gap: 1rem;
    margin: 1.4rem 0 1rem;
}

.auth-form label {
    display: grid;
    gap: 0.42rem;
    color: var(--muted);
    font-weight: 800;
}

.auth-form input {
    width: 100%;
    border: 1px solid var(--line);
    border-radius: 8px;
    background: rgba(7, 17, 31, 0.82);
    color: var(--text);
    font: inherit;
    padding: 0.9rem 1rem;
}

.auth-form input:focus {
    border-color: var(--cyan);
    outline: 3px solid rgba(34, 211, 238, 0.16);
}

.auth-form button {
    cursor: pointer;
    border: 0;
    border-radius: 8px;
    padding: 0.95rem 1rem;
    background: linear-gradient(135deg, var(--cyan), var(--blue));
    color: #06111f;
    font-weight: 900;
}

.auth-form button:hover {
    filter: brightness(1.05);
}

.scafkit-hero {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(220px, 320px);
    gap: 1rem;
    align-items: end;
    padding: clamp(1.35rem, 4vw, 3rem);
}

.scafkit-command span {
    display: block;
    color: var(--gold);
    font-size: 0.72rem;
    font-weight: 900;
    text-transform: uppercase;
}

.scafkit-command strong {
    display: block;
    margin-top: 0.35rem;
    overflow-wrap: anywhere;
    color: var(--text);
}

.scafkit-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 1rem;
    margin-top: 1rem;
}

.scafkit-card {
    padding: 1.25rem;
}

.scafkit-card span {
    color: var(--gold);
    font-weight: 900;
}

.scafkit-card h2 {
    margin: 0.6rem 0 0.4rem;
    font-size: 1.1rem;
}

.toast {
    width: min(100% - 2rem, 760px);
    margin: 1rem auto;
    padding: 0.875rem 1rem;
    border-radius: 8px;
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

body[data-css-framework="bootstrap"] .auth-card,
body[data-css-framework="bootstrap"] .auth-intro,
body[data-css-framework="bootstrap"] .scafkit-hero,
body[data-css-framework="bootstrap"] .scafkit-card {
    backdrop-filter: blur(14px);
}

body[data-css-framework="tailwind"] .auth-form button {
    box-shadow: 0 18px 42px rgba(34, 211, 238, 0.18);
}

@media (max-width: 820px) {
    .site-header,
    .auth-page,
    .scafkit-hero,
    .scafkit-grid,
    .scafkit-metrics {
        grid-template-columns: 1fr;
    }

    .site-header {
        align-items: flex-start;
    }

    .auth-page {
        min-height: auto;
    }
}

@media (max-width: 560px) {
    .site-header {
        flex-direction: column;
    }

    .site-nav {
        width: 100%;
        justify-content: space-between;
    }
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
  generatePhpController,
  generatePhpRoute
};
