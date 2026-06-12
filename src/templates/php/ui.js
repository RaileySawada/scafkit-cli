function normalizePhpCssFramework(cssFramework) {
  const normalized = String(cssFramework || "css").toLowerCase();

  return ["css", "tailwind", "bootstrap"].includes(normalized) ? normalized : "css";
}

function createPhpHeadTemplate(cssFramework = "css") {
  const framework = normalizePhpCssFramework(cssFramework);

  return String.raw`<?php $meta = require dirname(__DIR__, 3) . '/config/meta.php'; ?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="<?= htmlspecialchars($meta['description']) ?>">
    <title><?= htmlspecialchars($title ?? $meta['title']) ?></title>
    <link rel="stylesheet" href="<?= BASE_URL ?>/css/login.css">
</head>
<body data-css-framework="${framework}">
`;
}

function createPhpFootTemplate() {
  return String.raw`    <script src="<?= BASE_URL ?>/js/login.js"></script>
</body>
</html>
`;
}

function createPhpHeaderTemplate() {
  return String.raw`<header class="site-header" aria-label="Application window">
    <div class="window-dots" aria-hidden="true">
        <span class="window-dot window-dot--red"></span>
        <span class="window-dot window-dot--yellow"></span>
        <span class="window-dot window-dot--green"></span>
    </div>
    <a class="window-title" href="<?= BASE_URL ?>/"><?= htmlspecialchars(APP_NAME) ?></a>
    <nav class="site-nav" aria-label="Primary">
        <a href="<?= BASE_URL ?>/">Login</a>
        <a href="<?= BASE_URL ?>/forgot-password">Recover</a>
    </nav>
</header>
`;
}

function createPhpLoginPageTemplate() {
  return String.raw`<main class="scafkit-page">
    <section class="login-stage" aria-label="Scafkit login preview">
        <div class="desktop-frame">
            <div class="login-screen">
                <div class="terminal-mark" aria-hidden="true">
                    <img src="<?= BASE_URL ?>/images/scafkit-terminal-icon.png" alt="">
                </div>

                <section class="login-card" aria-label="Scafkit account login">
                    <h1>SCAFKIT</h1>

                    <form method="POST" action="<?= BASE_URL ?>/login" class="auth-form">
                        <label>
                            <span>USERNAME</span>
                            <input type="email" name="email" autocomplete="email" required>
                        </label>

                        <label>
                            <span>PASSWORD</span>
                            <input type="password" name="password" autocomplete="current-password" required>
                        </label>

                        <p class="attempts">Login attempts: <?= (int) ($loginAttempts ?? 0) ?></p>

                        <button type="submit">LOG IN</button>
                    </form>

                    <a class="forgot-link" href="<?= BASE_URL ?>/forgot-password">Forgot Password?</a>
                </section>
            </div>
        </div>
    </section>

    <section class="scafkit-details" aria-label="Scafkit PHP starter details">
        <div class="details-copy">
            <span class="eyebrow">Generated PHP starter</span>
            <h2>Ship a Scafkit-branded PHP MVC app from the CLI.</h2>
            <p>
                This template gives you a clean PHP MVC foundation with auth screens, controllers,
                routes, models, sessions, database setup, and style choices for CSS, Tailwind, or Bootstrap.
            </p>
        </div>

        <div class="command-grid" aria-label="Useful Scafkit commands">
            <article>
                <span>Create PHP app</span>
                <code>scafkit php app --tw</code>
            </article>
            <article>
                <span>Make controller</span>
                <code>scafkit make:controller Project index show</code>
            </article>
            <article>
                <span>Make route</span>
                <code>scafkit make:route GET /projects ProjectController@index</code>
            </article>
            <article>
                <span>Run local PHP</span>
                <code>scafkit run php</code>
            </article>
            <article>
                <span>Connect database first</span>
                <code>mysql -u root -p &lt; database.sql</code>
            </article>
        </div>
    </section>
</main>
`;
}

function createPhpForgotPasswordPageTemplate() {
  return String.raw`<main class="scafkit-page scafkit-page--center">
    <section class="recover-panel" aria-label="Recover account">
        <span class="eyebrow">Account recovery</span>
        <h1>Recover Scafkit access</h1>
        <p>Enter the account email and connect your recovery delivery flow behind this PHP screen.</p>

        <form method="POST" action="<?= BASE_URL ?>/forgot-password" class="auth-form auth-form--light">
            <label>
                <span>EMAIL</span>
                <input type="email" name="email" autocomplete="email" required>
            </label>

            <button type="submit">SEND RECOVERY INSTRUCTIONS</button>
        </form>

        <a class="forgot-link forgot-link--dark" href="<?= BASE_URL ?>/">Back to login</a>
    </section>
</main>
`;
}

function createPhpGeneratedViewTemplate(pageName, title) {
  return String.raw`<main class="scafkit-page scafkit-page--center">
    <section class="recover-panel generated-panel">
        <span class="eyebrow">Scafkit generated module</span>
        <h1>${title}</h1>
        <p>
            This page was scaffolded with a controller, model slot, and view surface so your PHP MVC
            app can keep growing from the command line.
        </p>

        <div class="command-grid command-grid--single" aria-label="Generated module details">
            <article>
                <span>Controller boundary</span>
                <code>Ready</code>
            </article>
            <article>
                <span>Model slot</span>
                <code>${pageName}</code>
            </article>
            <article>
                <span>Current route</span>
                <code><?= htmlspecialchars($_SERVER['REQUEST_URI'] ?? '/') ?></code>
            </article>
        </div>
    </section>
</main>
`;
}

function createPhpStyles() {
  return String.raw`:root {
    color-scheme: dark;
    --page: #031523;
    --panel: #062a3b;
    --panel-deep: #04101b;
    --cyan: #6ee7ff;
    --cyan-strong: #13c8e7;
    --blue: #1d73da;
    --blue-strong: #155fc4;
    --text: #f4fbff;
    --muted: #9bd1df;
    --line: rgba(158, 232, 255, 0.22);
    --shadow: 0 28px 80px rgba(0, 0, 0, 0.42);
    --radius: 8px;
}

* {
    box-sizing: border-box;
}

html {
    min-width: 320px;
}

body {
    margin: 0;
    min-height: 100vh;
    background:
        radial-gradient(circle at 18% 12%, rgba(49, 203, 221, 0.22), transparent 28rem),
        radial-gradient(circle at 82% 8%, rgba(32, 118, 217, 0.2), transparent 30rem),
        linear-gradient(135deg, #052132 0%, #063f50 46%, #041727 100%);
    color: var(--text);
    font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

body::before {
    position: fixed;
    inset: 0;
    pointer-events: none;
    content: "";
    background-image:
        linear-gradient(rgba(125, 231, 255, 0.08) 1px, transparent 1px),
        linear-gradient(90deg, rgba(125, 231, 255, 0.08) 1px, transparent 1px);
    background-size: 44px 44px;
    mask-image: linear-gradient(180deg, rgba(0, 0, 0, 0.78), transparent 82%);
}

a {
    color: inherit;
    font-weight: 800;
}

.site-header,
.scafkit-page {
    position: relative;
    margin: 0 auto;
    z-index: 1;
}

.site-header {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    align-items: center;
    gap: 0.8rem;
    width: 100%;
    min-height: 2.45rem;
    border-bottom: 1px solid rgba(158, 232, 255, 0.18);
    background: rgba(3, 15, 25, 0.72);
    padding: 0 1rem;
    backdrop-filter: blur(16px);
}

.window-dots {
    display: inline-grid;
    grid-template-columns: repeat(3, auto);
    align-items: center;
    gap: 0.45rem;
}

.window-title {
    justify-self: center;
    color: rgba(244, 251, 255, 0.78);
    font-size: 0.78rem;
    font-weight: 800;
    text-decoration: none;
}

.window-title:hover {
    color: #ffffff;
}

.site-nav {
    display: inline-flex;
    align-items: center;
    gap: 0.65rem;
}

.site-nav a {
    border: 1px solid var(--line);
    border-radius: var(--radius);
    background: rgba(7, 38, 55, 0.54);
    color: var(--muted);
    font-size: 0.78rem;
    padding: 0.38rem 0.58rem;
    text-decoration: none;
}

.site-nav a:hover {
    border-color: rgba(110, 231, 255, 0.55);
    color: var(--text);
}

.site-footer {
    position: relative;
    z-index: 1;
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto auto;
    align-items: center;
    gap: 1rem;
    border-top: 1px solid rgba(158, 232, 255, 0.18);
    background: rgba(3, 15, 25, 0.78);
    color: var(--muted);
    padding: 1rem max(1rem, calc((100vw - 1180px) / 2));
    backdrop-filter: blur(16px);
}

.site-footer strong {
    display: block;
    color: #ffffff;
    font-size: 0.95rem;
}

.site-footer p {
    margin: 0.2rem 0 0;
    color: var(--muted);
    font-size: 0.86rem;
}

.site-footer nav {
    display: inline-flex;
    align-items: center;
    gap: 0.75rem;
}

.site-footer a {
    color: #d9f8ff;
    font-size: 0.86rem;
    text-decoration: none;
}

.site-footer a:hover {
    color: #ffffff;
    text-decoration: underline;
}

.site-footer > span {
    color: rgba(217, 248, 255, 0.72);
    font-size: 0.84rem;
    font-weight: 800;
}

.scafkit-page {
    display: grid;
    gap: 0;
    width: 100%;
    padding: 0;
}

.scafkit-page--center {
    width: min(1180px, calc(100vw - 2rem));
    min-height: calc(100vh - 7rem);
    place-items: center;
    padding: 2rem 0;
}

.login-stage {
    display: grid;
    min-height: calc(100vh - 2.45rem);
    padding: 0;
}

.desktop-frame {
    overflow: hidden;
    width: 100%;
}

.window-dot {
    width: 0.48rem;
    height: 0.48rem;
    border-radius: 999px;
}

.window-dot--red {
    background: #ff6f63;
}

.window-dot--yellow {
    background: #ffc857;
}

.window-dot--green {
    background: #56d36d;
}

.login-screen {
    display: grid;
    grid-template-columns: minmax(240px, 0.92fr) minmax(290px, 0.74fr);
    align-items: center;
    min-height: calc(100vh - 2.45rem);
    background: transparent;
    padding: clamp(1.35rem, 5vw, 5.5rem) max(1rem, calc((100vw - 1180px) / 2));
}

.terminal-mark {
    display: grid;
    place-items: center;
}

.terminal-mark img {
    width: min(76%, 340px);
    filter: drop-shadow(0 22px 28px rgba(0, 0, 0, 0.34));
}

.login-card {
    display: grid;
    justify-self: stretch;
    width: min(100%, 345px);
}

h1,
h2,
p {
    margin-top: 0;
}

.login-card h1 {
    margin: 0 0 2rem;
    color: #ffffff;
    font-size: clamp(3rem, 7vw, 5.35rem);
    font-weight: 950;
    letter-spacing: 0;
    line-height: 0.92;
    text-shadow: 0 5px 13px rgba(0, 0, 0, 0.42);
}

.auth-form {
    display: grid;
    gap: 0.95rem;
}

.auth-form label {
    display: grid;
    gap: 0.38rem;
    color: #e4fbff;
    font-size: 0.82rem;
    font-weight: 800;
}

.auth-form input {
    width: 100%;
    min-height: 2.55rem;
    border: 1px solid rgba(112, 230, 255, 0.22);
    border-radius: var(--radius);
    background: rgba(4, 47, 67, 0.74);
    color: #ffffff;
    font: inherit;
    padding: 0.7rem 0.85rem;
    box-shadow: inset 0 1px 6px rgba(0, 0, 0, 0.24);
}

.auth-form input:focus {
    border-color: rgba(110, 231, 255, 0.9);
    box-shadow:
        0 0 0 4px rgba(110, 231, 255, 0.12),
        inset 0 1px 6px rgba(0, 0, 0, 0.24);
    outline: 0;
}

.attempts {
    margin: 0.05rem 0 1.45rem;
    color: #ffffff;
    font-size: clamp(1rem, 2.4vw, 1.25rem);
    text-align: center;
    text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.auth-form button {
    cursor: pointer;
    min-height: 2.75rem;
    border: 0;
    border-radius: 999px;
    background: linear-gradient(180deg, #2583dc, #1365c2);
    color: #ffffff;
    font: inherit;
    font-weight: 950;
    box-shadow: 0 13px 24px rgba(0, 61, 142, 0.35);
}

.auth-form button:hover {
    background: linear-gradient(180deg, #3294ec, #1b70cf);
}

.auth-form button:disabled {
    cursor: wait;
    opacity: 0.72;
}

.forgot-link {
    justify-self: center;
    margin-top: 1rem;
    color: #ffffff;
    font-size: 0.9rem;
    text-shadow: 0 2px 7px rgba(0, 0, 0, 0.4);
}

.forgot-link--dark {
    color: #063144;
    text-shadow: none;
}

.scafkit-details,
.recover-panel {
    border: 1px solid rgba(112, 230, 255, 0.25);
    border-radius: var(--radius);
    background: rgba(245, 252, 255, 0.96);
    color: #062237;
    box-shadow: var(--shadow);
}

.scafkit-details {
    display: grid;
    grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
    gap: clamp(1rem, 3vw, 2rem);
    align-items: start;
    width: 100%;
    border-width: 1px 0;
    border-radius: 0;
    background: linear-gradient(180deg, rgba(245, 252, 255, 0.98), rgba(224, 244, 250, 0.96));
    padding: clamp(2rem, 6vw, 5rem) max(1rem, calc((100vw - 1180px) / 2));
}

.details-copy h2,
.recover-panel h1 {
    margin: 0.8rem 0 0.85rem;
    font-size: clamp(2rem, 4.4vw, 3.6rem);
    line-height: 1;
}

.details-copy p,
.recover-panel p {
    color: #426277;
    line-height: 1.7;
}

.eyebrow {
    display: inline-flex;
    width: fit-content;
    border: 1px solid rgba(19, 200, 231, 0.3);
    border-radius: 999px;
    background: rgba(19, 200, 231, 0.1);
    color: #056073;
    font-size: 0.74rem;
    font-weight: 950;
    letter-spacing: 0;
    padding: 0.34rem 0.68rem;
    text-transform: uppercase;
}

.command-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.75rem;
}

.command-grid--single {
    grid-template-columns: 1fr;
    margin-top: 1.15rem;
}

.command-grid article {
    border: 1px solid #d7e9f0;
    border-radius: var(--radius);
    background: #ffffff;
    padding: 1rem;
}

.command-grid span {
    display: block;
    margin-bottom: 0.65rem;
    color: #557084;
    font-size: 0.86rem;
    font-weight: 900;
}

code {
    display: block;
    border-radius: 7px;
    background: #041727;
    color: #a9f3ff;
    font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace;
    font-size: 0.78rem;
    line-height: 1.55;
    overflow-wrap: anywhere;
    padding: 0.65rem 0.72rem;
}

.recover-panel {
    width: min(620px, 100%);
    padding: clamp(1.35rem, 4vw, 2.5rem);
}

.auth-form--light {
    margin-top: 1.25rem;
}

.auth-form--light label {
    color: #12364b;
}

.auth-form--light input {
    border-color: #c8dce5;
    background: #ffffff;
    color: #062237;
}

.generated-panel {
    width: min(760px, 100%);
}

.toast {
    position: relative;
    z-index: 2;
    width: min(100% - 2rem, 760px);
    margin: 1rem auto;
    border-radius: var(--radius);
    color: white;
    padding: 0.875rem 1rem;
}

.toast--error {
    background: #dc2626;
}

.toast--success {
    background: #059669;
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

body[data-css-framework="bootstrap"] .auth-form button,
body[data-css-framework="tailwind"] .auth-form button {
    box-shadow: 0 14px 26px rgba(0, 61, 142, 0.38);
}

@media (max-width: 920px) {
    .login-screen,
    .scafkit-details {
        grid-template-columns: 1fr;
    }

    .terminal-mark img {
        width: min(42vw, 235px);
    }

    .login-card {
        justify-self: center;
    }

    .login-card h1 {
        text-align: center;
    }
}

@media (max-width: 680px) {
    .site-header {
        grid-template-columns: auto 1fr;
        min-height: auto;
        padding: 0.7rem 1rem;
    }

    .site-nav {
        grid-column: 1 / -1;
        width: 100%;
        justify-content: space-between;
    }

    .login-screen {
        min-height: calc(100vh - 5.4rem);
        padding: 1.5rem 1rem 2rem;
    }

    .terminal-mark img {
        width: min(58vw, 190px);
    }

    .login-card {
        width: min(100%, 310px);
    }

    .command-grid {
        grid-template-columns: 1fr;
    }

    .site-footer {
        grid-template-columns: 1fr;
    }

    .site-footer nav {
        justify-content: space-between;
    }
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}
`;
}

module.exports = {
  createPhpFootTemplate,
  createPhpForgotPasswordPageTemplate,
  createPhpGeneratedViewTemplate,
  createPhpHeaderTemplate,
  createPhpHeadTemplate,
  createPhpLoginPageTemplate,
  createPhpStyles,
  normalizePhpCssFramework,
};
