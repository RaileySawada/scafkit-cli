const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");
const { c, A, A3, DIM, ICON, hRule } = require("../ui/theme");

const ROOT_HTACCESS = `RewriteEngine On

# Block direct browser access to Laravel app files
RewriteRule ^laravel-app(/|$) - [F,L]
RewriteRule ^\\.env$ - [F,L]

# Redirect all requests to the public folder
RewriteRule ^$ public/ [L]
RewriteRule (.*) public/$1 [L]
`;

const PUBLIC_INDEX = `<?php

use Illuminate\\Foundation\\Application;
use Illuminate\\Http\\Request;

define('LARAVEL_START', microtime(true));

// Determine if the application is in maintenance mode...
if (file_exists($maintenance = __DIR__.'/../laravel-app/storage/framework/maintenance.php')) {
    require $maintenance;
}

// Register the Composer autoloader...
require __DIR__.'/../laravel-app/vendor/autoload.php';

// Bootstrap Laravel and handle the request...
/** @var Application $app */
$app = require_once __DIR__.'/../laravel-app/bootstrap/app.php';

$app->usePublicPath(__DIR__);

$app->handleRequest(Request::capture());
`;

function createFallbackSpinner(text) {
  let timer = null;
  const frames = ["-", "\\", "|", "/"];
  let index = 0;

  function render(label) {
    if (!process.stdout.isTTY) return;
    process.stdout.write(`\r  ${A}${frames[index % frames.length]}${c.reset} ${c.white}${label}${c.reset}`);
    index += 1;
  }

  return {
    start() {
      if (!process.stdout.isTTY) {
        console.log(`  ${A}${ICON.work}${c.reset} ${c.white}${text}${c.reset}`);
        return;
      }

      render(text);
      timer = setInterval(() => render(text), 90);
    },
    succeed(message = text) {
      if (timer) clearInterval(timer);
      if (process.stdout.isTTY) {
        process.stdout.write(`\r  ${c.green}${ICON.selected}${c.reset} ${c.white}${message}${c.reset}\n`);
      }
    },
    fail(message = text) {
      if (timer) clearInterval(timer);
      if (process.stdout.isTTY) {
        process.stdout.write(`\r  ${c.bRed}${ICON.fail}${c.reset} ${c.white}${message}${c.reset}\n`);
      }
    },
  };
}

async function createSpinner(text) {
  if (!process.stdout.isTTY) {
    return createFallbackSpinner(text);
  }

  return createFallbackSpinner(text);
}

async function withSpinner(text, task) {
  const spinner = await createSpinner(text);

  spinner.start();

  try {
    const result = await task();
    spinner.succeed(text);
    return result;
  } catch (error) {
    spinner.fail(text);
    throw error;
  }
}

function printError(title, message) {
  console.log(`\n  ${A3}${c.bold}${ICON.warn} ${title}${c.reset}`);
  if (message) {
    console.log(`  ${DIM}${message}${c.reset}`);
  }
  console.log();
}

function printSuccess(title, fields) {
  console.log(`\n  ${A}${c.bold}${ICON.selected} ${title}${c.reset}`);
  console.log(`  ${hRule(44)}`);
  fields.forEach(([label, value]) => {
    console.log(`  ${DIM}${label.padEnd(14)}${c.reset}${c.white}${value}${c.reset}`);
  });
  console.log();
}

function runCommand(command, args, cwd) {
  const display = [command, ...args].join(" ");
  const winCommand = process.platform === "win32";
  const childCommand = winCommand ? "cmd.exe" : command;
  const childArgs = winCommand ? ["/d", "/s", "/c", display] : args;

  return new Promise((resolve) => {
    let stdout = "";
    let stderr = "";
    const child = spawn(childCommand, childArgs, {
      cwd,
      stdio: ["ignore", "pipe", "pipe"],
      shell: false,
    });

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    child.on("error", (error) => {
      resolve({ ok: false, message: error.message, stdout, stderr });
    });

    child.on("close", (status) => {
      resolve({
        ok: status === 0,
        message: status === 0 ? "Command completed" : `A build step failed with code ${status}.`,
        stdout,
        stderr,
      });
    });
  });
}

function readableFailure(result, fallback) {
  const details = String(result.stderr || result.stdout || "")
    .trim()
    .split(/\r?\n/)
    .filter(Boolean)
    .slice(-4)
    .join("\n");

  return details || result.message || fallback;
}

async function runRequired(command, args, cwd, message) {
  await withSpinner(message, async () => {
    const result = await runCommand(command, args, cwd);

    if (!result.ok) {
      throw new Error(readableFailure(result, `${message} failed.`));
    }
  });
}

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return null;
  }
}

function readEnv(envPath) {
  if (!fs.existsSync(envPath)) {
    return {};
  }

  const values = {};
  const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);

  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) return;

    const index = trimmed.indexOf("=");
    const key = trimmed.slice(0, index).trim();
    let value = trimmed.slice(index + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    values[key] = value;
  });

  return values;
}

function setEnvValues(envPath, updates) {
  const existing = fs.existsSync(envPath) ? fs.readFileSync(envPath, "utf8") : "";
  const lines = existing.split(/\r?\n/);
  const seen = new Set();
  const next = lines.map((line) => {
    const match = line.match(/^([A-Z0-9_]+)=/);
    if (!match || !Object.prototype.hasOwnProperty.call(updates, match[1])) {
      return line;
    }

    seen.add(match[1]);
    return `${match[1]}=${updates[match[1]]}`;
  });

  Object.entries(updates).forEach(([key, value]) => {
    if (!seen.has(key)) {
      next.push(`${key}=${value}`);
    }
  });

  fs.writeFileSync(envPath, `${next.join("\n").replace(/\n+$/, "")}\n`);
}

function isLaravelProject(projectDir) {
  const composer = readJson(path.join(projectDir, "composer.json"));
  const deps = {
    ...composer?.require,
    ...composer?.["require-dev"],
  };

  return (
    fs.existsSync(path.join(projectDir, "artisan")) &&
    fs.existsSync(path.join(projectDir, "public", "index.php")) &&
    Boolean(deps["laravel/framework"])
  );
}

function getAppName(projectDir) {
  const env = readEnv(path.join(projectDir, ".env"));
  const rawName = env.APP_NAME || path.basename(projectDir);
  const cleaned = rawName
    .replace(/^["']|["']$/g, "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/gi, "-")
    .replace(/^-+|-+$/g, "");

  return cleaned || "laravel-app";
}

function resolveBuildRoot(projectDir, appName) {
  const baseName = appName.endsWith("-build") ? appName : `${appName}-build`;
  const preferred = path.join(projectDir, baseName);

  if (!fs.existsSync(preferred)) {
    return preferred;
  }

  for (let i = 1; i < 100; i += 1) {
    const candidate = path.join(projectDir, `${path.basename(preferred)}-${i}`);
    if (!fs.existsSync(candidate)) {
      return candidate;
    }
  }

  throw new Error(`Could not find an available build folder near ${preferred}`);
}

function pathParts(filePath) {
  return filePath.split(/[\\/]+/).filter(Boolean);
}

function isWithinDir(relativePath, dirName) {
  return pathParts(relativePath)[0] === dirName;
}

function matchesSimpleGlob(relativePath, pattern) {
  const normalized = relativePath.replace(/\\/g, "/");
  const escaped = pattern
    .replace(/[.+^${}()|[\]\\]/g, "\\$&")
    .replace(/\*/g, ".*");
  return new RegExp(`^${escaped}$`).test(normalized);
}

function shouldExcludeLaravelApp(relativePath, entry) {
  const normalized = relativePath.replace(/\\/g, "/");
  const fileName = path.basename(normalized);
  const exact = new Set([
    "public",
    "node_modules",
    "tests",
    "phpunit.xml",
    ".editorconfig",
    ".env.example",
    ".gitattributes",
    ".gitignore",
    ".npmrc",
    "README.md",
    "package.json",
    "package-lock.json",
    "vite.config.js",
    "tailwind.config.js",
    "postcss.config.js",
    ".DS_Store",
    "Thumbs.db",
    "desktop.ini",
  ]);

  if (normalized.startsWith("storage/")) return isStorageCleanupPath(normalized);
  if (normalized.startsWith("bootstrap/cache/")) {
    return entry.isFile() && fileName.endsWith(".php");
  }
  if (exact.has(normalized) || exact.has(fileName)) return true;
  if (isWithinDir(normalized, ".git")) return true;
  if (matchesSimpleGlob(fileName, "*.log")) return true;
  if (matchesSimpleGlob(fileName, "npm-debug.log*")) return true;
  if (matchesSimpleGlob(fileName, "yarn-debug.log*")) return true;
  if (matchesSimpleGlob(fileName, "yarn-error.log*")) return true;
  if (matchesSimpleGlob(fileName, "pnpm-debug.log*")) return true;

  return false;
}

function isStorageCleanupPath(normalizedPath) {
  const parts = pathParts(normalizedPath);
  const fileName = parts[parts.length - 1] || "";

  if (normalizedPath === "storage/logs/laravel.log") {
    return true;
  }

  return (
    parts.length === 4 &&
    parts[0] === "storage" &&
    parts[1] === "framework" &&
    parts[2] === "views" &&
    fileName.endsWith(".php")
  );
}

function shouldExcludePublic(relativePath) {
  const normalized = relativePath.replace(/\\/g, "/");
  const fileName = path.basename(normalized);

  if (normalized === "hot" || normalized === "storage") return true;
  if (isWithinDir(normalized, "storage")) return true;
  if (fileName.endsWith(".map")) return true;
  if (matchesSimpleGlob(fileName, "*.log")) return true;
  if (matchesSimpleGlob(fileName, "npm-debug.log*")) return true;
  if (matchesSimpleGlob(fileName, "yarn-debug.log*")) return true;
  if (matchesSimpleGlob(fileName, "yarn-error.log*")) return true;
  if (matchesSimpleGlob(fileName, "pnpm-debug.log*")) return true;
  if ([".DS_Store", "Thumbs.db", "desktop.ini"].includes(fileName)) return true;

  return false;
}

function isBuildOutputDir(relativePath, baseName) {
  const firstPart = pathParts(relativePath)[0];
  if (!firstPart) return false;
  if (firstPart === baseName) return true;

  const suffix = firstPart.slice(baseName.length + 1);
  return firstPart.startsWith(`${baseName}-`) && /^\d+$/.test(suffix);
}

function copyFiltered(sourceDir, targetDir, shouldExclude, baseDir = sourceDir) {
  fs.mkdirSync(targetDir, { recursive: true });

  for (const entry of fs.readdirSync(sourceDir, { withFileTypes: true })) {
    const sourcePath = path.join(sourceDir, entry.name);
    const relativePath = path.relative(baseDir, sourcePath);

    if (shouldExclude(relativePath, entry)) {
      continue;
    }

    const targetPath = path.join(targetDir, entry.name);

    if (entry.isDirectory()) {
      copyFiltered(sourcePath, targetPath, shouldExclude, baseDir);
      continue;
    }

    if (entry.isFile()) {
      fs.mkdirSync(path.dirname(targetPath), { recursive: true });
      fs.copyFileSync(sourcePath, targetPath);
    }
  }
}

function migrationFiles(projectDir) {
  const dir = path.join(projectDir, "database", "migrations");
  if (!fs.existsSync(dir)) return [];

  return fs
    .readdirSync(dir)
    .filter((name) => name.endsWith(".php"))
    .map((name) => path.join(dir, name));
}

function migrationsContain(projectDir, pattern) {
  return migrationFiles(projectDir).some((filePath) => {
    const text = fs.readFileSync(filePath, "utf8");
    return pattern.test(text);
  });
}

async function ensureDatabaseTables(projectDir) {
  const created = [];

  const hasCacheTable = migrationsContain(projectDir, /create\s*\(\s*['"]cache['"]/);
  const hasCacheLocksTable = migrationsContain(projectDir, /create\s*\(\s*['"]cache_locks['"]/);
  const hasSessionsTable = migrationsContain(projectDir, /create\s*\(\s*['"]sessions['"]/);

  if (!hasCacheTable || !hasCacheLocksTable) {
    await runRequired(
      "php",
      ["artisan", "make:cache-table"],
      projectDir,
      "Preparing database cache tables",
    );
    created.push("cache/cache_locks");
  }

  if (!hasSessionsTable) {
    await runRequired(
      "php",
      ["artisan", "make:session-table"],
      projectDir,
      "Preparing database session table",
    );
    created.push("sessions");
  }

  if (created.length > 0) {
    await runRequired(
      "php",
      ["artisan", "migrate", "--force"],
      projectDir,
      "Updating local database tables",
    );
  }

  return created;
}

function dumpDatabase(projectDir, buildRoot) {
  const env = readEnv(path.join(projectDir, ".env"));
  const connection = String(env.DB_CONNECTION || "").toLowerCase();

  if (!["mysql", "mariadb"].includes(connection)) {
    return { ok: false, message: `DB_CONNECTION=${env.DB_CONNECTION || "(empty)"} is not supported for SQL export.` };
  }

  if (!env.DB_DATABASE) {
    return { ok: false, message: "DB_DATABASE is missing from .env." };
  }

  const sqlPath = path.join(buildRoot, `${env.DB_DATABASE}.sql`);
  const args = [
    `--host=${env.DB_HOST || "127.0.0.1"}`,
    `--port=${env.DB_PORT || "3306"}`,
    `--user=${env.DB_USERNAME || "root"}`,
  ];

  if (env.DB_PASSWORD) {
    args.push(`--password=${env.DB_PASSWORD}`);
  }

  args.push(env.DB_DATABASE);

  return new Promise((resolve) => {
    const child = spawn("mysqldump", args, {
      cwd: projectDir,
      stdio: ["ignore", "pipe", "pipe"],
      shell: false,
    });
    const output = fs.createWriteStream(sqlPath);
    let stderr = "";

    child.stdout.pipe(output);
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    child.on("error", (error) => {
      output.close();
      fs.rmSync(sqlPath, { force: true });
      resolve({ ok: false, message: error.message });
    });

    child.on("close", (status) => {
      output.close();
      if (status === 0) {
        resolve({ ok: true, path: sqlPath });
        return;
      }

      fs.rmSync(sqlPath, { force: true });
      resolve({ ok: false, message: stderr.trim() || `mysqldump exited with code ${status}` });
    });
  });
}

async function handleLaravelBuild() {
  const projectDir = process.cwd();

  if (!isLaravelProject(projectDir)) {
    printError(
      "Laravel app not found",
      "Run scafkit laravel:build from a Laravel project root with artisan, composer.json, and public/index.php.",
    );
    return;
  }

  try {
    await withSpinner("Checking Laravel requirements", async () => {
      const composer = await runCommand("composer", ["--version"], projectDir);
      if (!composer.ok) {
        throw new Error("Composer was not found. Install Composer or make sure it is available in your terminal.");
      }

      const artisan = await runCommand("php", ["artisan", "--version"], projectDir);
      if (!artisan.ok) {
        throw new Error("Laravel could not start from this folder. Run this command from your Laravel project root.");
      }
    });

    await runRequired(
      "composer",
      ["install", "--no-dev", "--optimize-autoloader"],
      projectDir,
      "Installing production PHP dependencies",
    );

    if (fs.existsSync(path.join(projectDir, "package.json"))) {
      await runRequired("npm", ["install"], projectDir, "Installing frontend dependencies");
      await runRequired("npm", ["run", "build"], projectDir, "Building frontend assets");
    }

    const clearCommands = ["config:clear", "route:clear", "view:clear", "cache:clear"];
    const cacheCommands = ["config:cache", "route:cache", "view:cache", "event:cache"];

    await withSpinner("Clearing Laravel caches", async () => {
      for (const command of clearCommands) {
        const result = await runCommand("php", ["artisan", command], projectDir);
        if (!result.ok) {
          throw new Error(readableFailure(result, "Clearing Laravel caches failed."));
        }
      }
    });

    const createdTables = await ensureDatabaseTables(projectDir);

    await withSpinner("Optimizing Laravel caches", async () => {
      for (const command of cacheCommands) {
        const result = await runCommand("php", ["artisan", command], projectDir);
        if (!result.ok) {
          throw new Error(readableFailure(result, "Optimizing Laravel caches failed."));
        }
      }
    });

    const appName = getAppName(projectDir);
    const buildRoot = resolveBuildRoot(projectDir, appName);
    const buildBaseName = appName.endsWith("-build") ? appName : `${appName}-build`;
    const laravelAppDir = path.join(buildRoot, "laravel-app");
    const publicDir = path.join(buildRoot, "public");

    await withSpinner("Packaging deployment files", async () => {
      fs.mkdirSync(buildRoot, { recursive: true });

      copyFiltered(projectDir, laravelAppDir, (relativePath, entry) => {
        if (isBuildOutputDir(relativePath, buildBaseName)) {
          return true;
        }

        return shouldExcludeLaravelApp(relativePath, entry);
      });
      copyFiltered(path.join(projectDir, "public"), publicDir, shouldExcludePublic);

      fs.writeFileSync(path.join(publicDir, "index.php"), PUBLIC_INDEX);
      fs.writeFileSync(path.join(buildRoot, ".htaccess"), ROOT_HTACCESS);
      setEnvValues(path.join(laravelAppDir, ".env"), {
        APP_ENV: "production",
        APP_DEBUG: "false",
        APP_URL: "https://your.domain.example",
        DB_CONNECTION: "mysql",
        SESSION_DRIVER: "database",
        CACHE_STORE: "database",
      });
    });

    const dump = await withSpinner("Exporting database SQL", () =>
      dumpDatabase(projectDir, buildRoot),
    );
    if (!dump.ok) {
      console.log(`  ${A3}${ICON.warn}${c.reset} ${DIM}SQL export skipped: ${dump.message}${c.reset}`);
    }

    printSuccess("Laravel build ready", [
      ["Build", buildRoot],
      ["App", laravelAppDir],
      ["Public", publicDir],
      ["SQL", dump.ok ? dump.path : "not generated"],
      ["Tables", createdTables.length ? createdTables.join(", ") : "already present"],
    ]);
  } catch (error) {
    printError("Laravel build failed", error.message);
  }
}

module.exports = { handleLaravelBuild };
