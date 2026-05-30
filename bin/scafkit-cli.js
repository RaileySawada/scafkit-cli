#!/usr/bin/env node

const readline = require("readline");
const path = require("path");
const fs = require("fs");
const os = require("os");
const {
  generatePhpProject,
  generatePhpController,
  generatePhpRoute,
} = require("../src/generators/phpGenerator");
const { generatePernProject } = require("../src/generators/pernGenerator");
const { generateReactProject } = require("../src/generators/reactGenerator");
const { spawn, spawnSync } = require("child_process");
const packageJson = require("../package.json");

function enableUtf8Console() {
  if (process.platform !== "win32") {
    return;
  }

  spawnSync("chcp.com", ["65001"], {
    stdio: "ignore",
    shell: false,
  });
}

const c = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  italic: "\x1b[3m",

  black: "\x1b[30m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",

  bBlack: "\x1b[90m",
  bRed: "\x1b[91m",
  bGreen: "\x1b[92m",
  bYellow: "\x1b[93m",
  bBlue: "\x1b[94m",
  bMagenta: "\x1b[95m",
  bCyan: "\x1b[96m",
  bWhite: "\x1b[97m",

  fg: (n) => `\x1b[38;5;${n}m`,
};

const GRAD = [c.fg(51), c.fg(45), c.fg(39), c.fg(33), c.fg(27), c.fg(21)];

const A = c.fg(51);
const A2 = c.fg(226);
const A3 = c.fg(226);
const DIM = c.bBlack;

const ICON = Object.freeze({
  bolt: "⚡",
  warn: "!",
  mark: "◆",
  work: "◈",
  arrow: "▸",
  fail: "x",
  dot: "·",
  selected: "●",
  unselected: "○",
  next: "→",
  hint: "← →",
});

const PKG = {
  name: packageJson.name,
  version: packageJson.version,
  author: packageJson.author || "Railey Sawada",
  meaning: "Starter scaffolding CLI",
};

function box(lines, accent = A) {
  const width = Math.max(...lines.map((l) => stripAnsi(l).length)) + 4;
  const top = `${accent}╭${"─".repeat(width - 2)}╮${c.reset}`;
  const bottom = `${accent}╰${"─".repeat(width - 2)}╯${c.reset}`;
  const middle = lines.map((l) => {
    const visible = stripAnsi(l).length;
    const pad = width - 2 - visible - 2;
    return `${accent}│${c.reset} ${l}${" ".repeat(Math.max(0, pad))} ${accent}│${c.reset}`;
  });
  return [top, ...middle, bottom].join("\n");
}

function hRule(width = 54, accent = DIM) {
  return `${accent}${"─".repeat(width)}${c.reset}`;
}

function stripAnsi(str) {
  return str.replace(/\x1b\[[0-9;]*m/g, "");
}

function padAnsiRight(value, width) {
  const visible = stripAnsi(value).length;
  return value + " ".repeat(Math.max(0, width - visible));
}

function banner() {
  const rows = [
    " ███████╗ ██████╗ █████╗ ███████╗██╗  ██╗██╗████████╗       ██████╗██╗     ██╗",
    " ██╔════╝██╔════╝██╔══██╗██╔════╝██║ ██╔╝██║╚══██╔══╝      ██╔════╝██║     ██║",
    " ███████╗██║     ███████║█████╗  █████╔╝ ██║   ██║   █████╗██║     ██║     ██║",
    " ╚════██║██║     ██╔══██║██╔══╝  ██╔═██╗ ██║   ██║   ╚════╝██║     ██║     ██║",
    " ███████║╚██████╗██║  ██║██║     ██║  ██╗██║   ██║         ╚██████╗███████╗██║",
    " ╚══════╝ ╚═════╝╚═╝  ╚═╝╚═╝     ╚═╝  ╚═╝╚═╝   ╚═╝          ╚═════╝╚══════╝╚═╝",
  ];

  const BLUE = c.fg(39);
  const BLUE2 = c.fg(33);
  const BLUE3 = c.fg(27);
  const BLUE4 = c.fg(21);
  const YELLOW = c.fg(226);
  const WHITE = c.bWhite;
  const MUTED = c.fg(240);

  const rowColors = [c.fg(87), c.fg(81), c.fg(45), BLUE, BLUE2, BLUE3];

  const W = Math.max(62, ...rows.map((row) => stripAnsi(row).length));

  const borderTop = `  ${BLUE}${c.bold}╔${"═".repeat(W + 2)}╗${c.reset}`;
  const borderBottom = `  ${BLUE}${c.bold}╚${"═".repeat(W + 2)}╝${c.reset}`;
  const empty = `  ${BLUE}${c.bold}║${c.reset} ${" ".repeat(W)} ${BLUE}${c.bold}║${c.reset}`;

  const centerText = (text) => {
    const len = stripAnsi(text).length;
    const left = Math.floor((W - len) / 2);
    const right = Math.max(0, W - len - left);
    return " ".repeat(left) + text + " ".repeat(right);
  };

  const line = (text = "") => {
    const visible = stripAnsi(text).length;
    const pad = Math.max(0, W - visible);
    return `  ${BLUE}${c.bold}║${c.reset} ${text}${" ".repeat(pad)} ${BLUE}${c.bold}║${c.reset}`;
  };

  const artLine = (row, color) => {
    const visible = stripAnsi(row).length;
    const pad = Math.max(0, W - visible);
    return `  ${BLUE}${c.bold}║${c.reset} ${color}${c.bold}${row}${c.reset}${" ".repeat(pad)} ${BLUE}${c.bold}║${c.reset}`;
  };

  console.log();
  console.log(borderTop);
  console.log(empty);

  rows.forEach((row, i) => {
    console.log(artLine(row, rowColors[i]));
  });

  console.log(empty);
  console.log(
    line(centerText(`${WHITE}${c.bold}Project starter kit${c.reset}`)),
  );
  console.log(
    line(
      centerText(
        `${MUTED}PHP MVC  ${ICON.dot}  PERN  ${ICON.dot}  React${c.reset}`,
      ),
    ),
  );
  console.log(line(centerText(`${BLUE}${c.bold}v${PKG.version}${c.reset}`)));
  console.log(empty);
  console.log(borderBottom);
  console.log();

  console.log(
    `  ${DIM}┌─[${c.reset}${BLUE}${c.bold}scafkit${c.reset}${DIM}]─[${c.reset}${YELLOW}${c.bold}ready${c.reset}${DIM}]${c.reset}`,
  );
  console.log(
    `  ${DIM}├─${c.reset} ${MUTED}templates${c.reset}  ${BLUE}${c.bold}php${c.reset} ${DIM}/${c.reset} ${BLUE}${c.bold}pern${c.reset} ${DIM}/${c.reset} ${BLUE}${c.bold}react${c.reset}`,
  );
  console.log(
    `  ${DIM}├─${c.reset} ${MUTED}create${c.reset}     ${YELLOW}${c.bold}php${c.reset} ${c.white}<app>${c.reset}   ${DIM}|${c.reset}   ${YELLOW}${c.bold}pern${c.reset} ${c.white}<app>${c.reset} ${DIM}--tw${c.reset}   ${DIM}|${c.reset}   ${YELLOW}${c.bold}react${c.reset} ${c.white}<app>${c.reset} ${DIM}--js${c.reset}`,
  );
  console.log(
    `  ${DIM}├─${c.reset} ${MUTED}ops${c.reset}        ${BLUE}${c.bold}help${c.reset} ${DIM}/${c.reset} ${BLUE}${c.bold}pwd${c.reset} ${DIM}/${c.reset} ${BLUE}${c.bold}cd${c.reset} ${c.white}<dir>${c.reset} ${DIM}/${c.reset} ${BLUE}${c.bold}run${c.reset} ${DIM}/${c.reset} ${BLUE}${c.bold}update${c.reset}`,
  );
  console.log(
    `  ${DIM}└─${c.reset} ${MUTED}php${c.reset}        ${YELLOW}${c.bold}make:controller${c.reset} ${c.white}Invoice approve reject${c.reset} ${DIM}/${c.reset} ${YELLOW}${c.bold}make:route${c.reset}`,
  );
  console.log();
}

function formatOptions(opts) {
  return opts
    .map(
      ([flag, desc]) =>
        `  ${A2}${c.bold}${flag.padEnd(16)}${c.reset}${c.white}${desc}${c.reset}`,
    )
    .join("\n");
}

function formatSteps(steps) {
  return steps
    .map((s, i) => `  ${DIM}${i + 1}.${c.reset} ${A}${s}${c.reset}`)
    .join("\n");
}

const HELP_TOPICS = {
  php: () => {
    console.log(`\n  ${A}${c.bold}${ICON.bolt} PHP MVC Starter${c.reset}`);
    console.log(`  ${hRule(48)}\n`);
    console.log(
      `  ${A2}${c.bold}scafkit php${c.reset} ${c.white}[folder] [options]${c.reset}\n`,
    );
    console.log(`${c.bold}  Options${c.reset}`);
    console.log(
      formatOptions([
        ["[folder]", "Target folder — use . for current directory"],
        ["make:controller", "Create a controller in the current PHP starter"],
        ["make:route", "Append a route and scaffold missing MVC files"],
        ["methodName", "Add one or more methods to the controller"],
        ["--tw", "Include Tailwind CSS through the generated layout"],
        ["--bs", "Include Bootstrap through the generated layout"],
        ["--dir <path>", "Create the target folder inside another directory"],
        ["--dry-run", "Preview files without writing them"],
        ["--force", "Overwrite any existing files"],
        ["--help", "Show this guide without writing files"],
      ]),
    );
    console.log(`\n${c.bold}  Use it for${c.reset}`);
    console.log(
      `  ${DIM}Server-rendered PHP MVC apps with auth, routing, sessions, and env config.${c.reset}`,
    );
    console.log(`\n${c.bold}  Recommended steps${c.reset}`);
    console.log(
      formatSteps([
        "scafkit php php-auth-app",
        "cd php-auth-app",
        "cp .env.example .env",
        "scafkit run php",
        "scafkit make:controller Invoice approve reject",
        "scafkit make:route GET /invoices InvoiceController@index",
      ]),
    );
    console.log();
  },

  pern: () => {
    console.log(
      `\n  ${A}${c.bold}${ICON.bolt} PERN Full-Stack Starter${c.reset}`,
    );
    console.log(`  ${hRule(48)}\n`);
    console.log(
      `  ${A2}${c.bold}scafkit pern${c.reset} ${c.white}[folder] [options]${c.reset}\n`,
    );
    console.log(`${c.bold}  Options${c.reset}`);
    console.log(
      formatOptions([
        ["[folder]", "Target folder — use . for current directory"],
        ["--sq-pg", "Use Sequelize v7 with PostgreSQL"],
        ["--sq-mysql", "Use Sequelize v7 with MySQL"],
        ["--sq-sqlite", "Use Sequelize v7 with SQLite"],
        ["--sq-mariadb", "Use Sequelize v7 with MariaDB"],
        ["--sq-mssql", "Use Sequelize v7 with Microsoft SQL Server"],
        ["--tw", "Include Tailwind CSS in the React client"],
        ["--ts / --js", "Choose TypeScript or JavaScript without prompting"],
        ["--yes", "Use defaults and install dependencies without prompting"],
        ["--no-install", "Create files without installing dependencies"],
        ["--pm <name>", "Install with npm, pnpm, yarn, or bun"],
        ["--dir <path>", "Create the target folder inside another directory"],
        ["--dry-run", "Preview files without writing them"],
        ["--force", "Overwrite any existing files"],
        ["--help", "Show this guide without writing files"],
      ]),
    );
    console.log(`\n${c.bold}  Use it for${c.reset}`);
    console.log(
      `  ${DIM}PostgreSQL + Express + React + Node with separated client/server workspaces.${c.reset}`,
    );
    console.log(`\n${c.bold}  Recommended steps${c.reset}`);
    console.log(
      formatSteps([
        "scafkit pern inventory-api --sq-pg --tw",
        "cd inventory-api/client && npm install",
        "cd ../server && npm install",
        "cp server/.env.example server/.env",
        "scafkit run",
      ]),
    );
    console.log();
  },

  react: () => {
    console.log(
      `\n  ${A}${c.bold}${ICON.bolt} React TypeScript Starter${c.reset}`,
    );
    console.log(`  ${hRule(48)}\n`);
    console.log(
      `  ${A2}${c.bold}scafkit react${c.reset} ${c.white}[folder] [options]${c.reset}\n`,
    );
    console.log(`${c.bold}  Options${c.reset}`);
    console.log(
      formatOptions([
        ["[folder]", "Target folder — use . for current directory"],
        ["--serverless", "Include Netlify Functions endpoints"],
        ["--tw", "Include Tailwind CSS"],
        ["--ts / --js", "Choose TypeScript or JavaScript without prompting"],
        ["--yes", "Use defaults and install dependencies without prompting"],
        ["--no-install", "Create files without installing dependencies"],
        ["--pm <name>", "Install with npm, pnpm, yarn, or bun"],
        ["--dir <path>", "Create the target folder inside another directory"],
        ["--dry-run", "Preview files without writing them"],
        ["--force", "Overwrite any existing files"],
        ["--help", "Show this guide without writing files"],
      ]),
    );
    console.log(`\n${c.bold}  Use it for${c.reset}`);
    console.log(
      `  ${DIM}Modern React TypeScript frontends, dashboards, landing apps, serverless web apps.${c.reset}`,
    );
    console.log(`\n${c.bold}  Recommended steps${c.reset}`);
    console.log(
      formatSteps([
        "scafkit react client-app --tw",
        "cd client-app && npm install",
        "scafkit run",
        "npm run build",
      ]),
    );
    console.log();
  },
};

function help(topic) {
  const key = topic && topic.toLowerCase().replace(/^scafkit-/, "");

  if (key && HELP_TOPICS[key]) {
    HELP_TOPICS[key]();
    return;
  }

  if (key) {
    console.log(
      `\n  ${A3}${c.bold}${ICON.warn} No help topic for "${topic}".${c.reset}  ` +
        `${DIM}Try ${c.reset}${A}help pern${c.reset}${DIM}, ${c.reset}${A}help react${c.reset}${DIM}, or ${c.reset}${A}help php${c.reset}\n`,
    );
    return;
  }

  console.log(`\n${c.bold}  Commands${c.reset}`);
  console.log(`  ${hRule(52)}\n`);

  const cmds = [
    [
      "scafkit pern   [folder]",
      "--sq-pg --sq-mysql --tw --ts --js --yes --no-install --pm --dir --dry-run --force",
      "PostgreSQL + Express + React + Node starter",
    ],
    [
      "scafkit react  [folder]",
      "--serverless --tw --ts --js --yes --no-install --pm --dir --dry-run --force",
      "React TypeScript, optionally with Netlify Functions",
    ],
    [
      "scafkit php    [folder]",
      "--tw --bs --dir --dry-run --force | make:controller | make:route",
      "PHP MVC authentication starter",
    ],
  ];

  cmds.forEach(([cmd, flags, desc]) => {
    console.log(`  ${A}${c.bold}${cmd}${c.reset}`);
    console.log(`    ${DIM}${flags}${c.reset}`);
    console.log(`    ${c.white}${desc}${c.reset}\n`);
  });

  console.log(
    `  ${A2}${c.bold}help ${c.reset}${c.white}[php|pern|react]${c.reset}`,
  );
  console.log(
    `    ${DIM}Detailed usage, options, and recommended commands.${c.reset}\n`,
  );

  console.log(
    `  ${A2}${c.bold}create${c.reset} ${c.white}<php|pern|react> <folder>${c.reset} ${DIM}${ICON.dot}${c.reset} ${A2}${c.bold}list${c.reset} ${DIM}${ICON.dot}${c.reset} ${A2}${c.bold}version${c.reset}`,
  );
  console.log(
    `    ${DIM}Create by template name, list available starters, or print the installed version.${c.reset}\n`,
  );

  console.log(
    `  ${A2}${c.bold}clear${c.reset} ${DIM}${ICON.dot}${c.reset} ${A2}${c.bold}pwd${c.reset} ${DIM}${ICON.dot}${c.reset} ${A2}${c.bold}cd${c.reset} ${DIM}${ICON.dot}${c.reset} ${A2}${c.bold}run${c.reset} ${DIM}${ICON.dot}${c.reset} ${A2}${c.bold}inspect${c.reset} ${DIM}${ICON.dot}${c.reset} ${A2}${c.bold}doctor${c.reset} ${DIM}${ICON.dot}${c.reset} ${A2}${c.bold}status${c.reset} ${DIM}${ICON.dot}${c.reset} ${A2}${c.bold}stop${c.reset}`,
  );
  console.log(
    `    ${DIM}Redraw banner ${ICON.dot} print directory ${ICON.dot} change directory ${ICON.dot} run dev servers ${ICON.dot} view or stop tracked servers.${c.reset}\n`,
  );
  console.log(
    `  ${A2}${c.bold}run${c.reset} ${c.white}[php|react|pern|status|stop all]${c.reset}`,
  );
  console.log(
    `    ${DIM}Start PHP, React, or PERN dev servers and print localhost links with active/inactive status.${c.reset}\n`,
  );
  console.log(`  ${A2}${c.bold}update${c.reset}`);
  console.log(
    `    ${DIM}Check npm for a newer CLI version and install it after confirmation. Use update --check to only check.${c.reset}\n`,
  );

  console.log(`  ${hRule(52)}\n`);
  console.log(`  ${c.bold}Fast start${c.reset}`);
  console.log(`  ${A}${ICON.arrow}${c.reset} scafkit pern my-app`);
  console.log(
    `  ${A}${ICON.arrow}${c.reset} scafkit react client-app --serverless --tw`,
  );
  console.log(`  ${A}${ICON.arrow}${c.reset} scafkit php auth-app`);
  console.log(
    `  ${A}${ICON.arrow}${c.reset} scafkit make:controller Invoice approve reject`,
  );
  console.log(
    `  ${A}${ICON.arrow}${c.reset} scafkit make:route GET /invoices InvoiceController@index`,
  );
  console.log(
    `\n  ${DIM}${c.italic}Tip: run ${c.reset}${A}help pern${c.reset}${DIM}${c.italic}, ${c.reset}${A}help react${c.reset}${DIM}${c.italic}, or ${c.reset}${A}help php${c.reset}${DIM}${c.italic} for focused guidance.${c.reset}\n`,
  );
}

function tokenize(input) {
  const tokens = [];
  const pattern = /"([^"]*)"|'([^']*)'|\S+/g;
  let match;
  while ((match = pattern.exec(input)) !== null) {
    tokens.push(match[1] ?? match[2] ?? match[0]);
  }
  return tokens;
}

function parseProjectArgs(args) {
  const options = {
    folderArg: ".",
    hasFolderArg: false,
    outputDir: null,
    force: false,
    help: false,
    yes: false,
    install: true,
    dryRun: false,
    sequelize: false,
    sequelizeDialect: null,
    serverless: false,
    tailwind: false,
    bootstrap: false,
    language: null,
    packageManager: "npm",
    customFlags: [],
    positionals: [],
  };
  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    switch (arg) {
      case "--force":
      case "-f":
        options.force = true;
        break;
      case "--yes":
      case "-y":
        options.yes = true;
        break;
      case "--no-install":
        options.install = false;
        break;
      case "--pm":
      case "--package-manager":
        options.packageManager = normalizePackageManager(args[i + 1]);
        i += 1;
        break;
      case "--dry-run":
        options.dryRun = true;
        break;
      case "--dir":
      case "--out-dir":
        options.outputDir = args[i + 1] || null;
        i += 1;
        break;
      case "--help":
      case "-h":
        options.help = true;
        break;
      case "--sequelize":
        options.sequelize = true;
        options.sequelizeDialect = "pg";
        break;
      case "--sq-pg":
      case "--sq-postgres":
        options.sequelize = true;
        options.sequelizeDialect = "pg";
        break;
      case "--sq-mysql":
        options.sequelize = true;
        options.sequelizeDialect = "mysql";
        break;
      case "--sq-sqlite":
        options.sequelize = true;
        options.sequelizeDialect = "sqlite";
        break;
      case "--sq-mariadb":
        options.sequelize = true;
        options.sequelizeDialect = "mariadb";
        break;
      case "--sq-mssql":
        options.sequelize = true;
        options.sequelizeDialect = "mssql";
        break;
      case "--serverless":
        options.serverless = true;
        break;
      case "--tw":
      case "--tailwind":
        options.tailwind = true;
        break;
      case "--bs":
      case "--bootstrap":
        options.bootstrap = true;
        break;
      case "--ts":
      case "--typescript":
        options.language = "typescript";
        break;
      case "--js":
      case "--javascript":
        options.language = "javascript";
        break;
      default:
        if (!arg.startsWith("-") && !options.hasFolderArg) {
          options.folderArg = arg;
          options.hasFolderArg = true;
          options.positionals.push(arg);
        } else if (!arg.startsWith("-")) {
          options.positionals.push(arg);
        } else if (arg.startsWith("--") && arg.length > 2) {
          options.customFlags.push(arg.slice(2));
        }
    }
  }
  return options;
}

function resolveTargetDir(folderArg, outputDir) {
  if (outputDir) {
    return path.resolve(process.cwd(), outputDir, folderArg);
  }

  return path.resolve(process.cwd(), folderArg);
}

function normalizePackageManager(value) {
  const pm = String(value || "npm").toLowerCase();

  if (["npm", "pnpm", "yarn", "bun"].includes(pm)) {
    return pm;
  }

  return "npm";
}

function detectPackageManager(projectDir, fallback = "npm") {
  if (fs.existsSync(path.join(projectDir, "pnpm-lock.yaml"))) return "pnpm";
  if (fs.existsSync(path.join(projectDir, "yarn.lock"))) return "yarn";
  if (fs.existsSync(path.join(projectDir, "bun.lockb"))) return "bun";
  if (fs.existsSync(path.join(projectDir, "bun.lock"))) return "bun";
  if (fs.existsSync(path.join(projectDir, "package-lock.json"))) return "npm";

  return normalizePackageManager(fallback);
}

function packageManagerArgs(packageManager, action, values = []) {
  const pm = normalizePackageManager(packageManager);

  if (action === "install") {
    return pm === "npm" ? ["install", "--loglevel=error"] : ["install"];
  }

  if (action === "addDev") {
    if (pm === "npm") return ["install", "-D", ...values, "--loglevel=error"];
    if (pm === "bun") return ["add", "-d", ...values];
    return ["add", "-D", ...values];
  }

  if (action === "run") {
    return ["run", ...values];
  }

  return values;
}

function packageManagerCommand(packageManager, args, cwd, options = {}) {
  const pm = normalizePackageManager(packageManager);

  if (process.platform === "win32") {
    return runCommand("cmd.exe", ["/d", "/s", "/c", `${pm} ${args.join(" ")}`], {
      cwd,
      ...options,
    });
  }

  return runCommand(pm, args, { cwd, ...options });
}

function commandVersion(command, args = ["--version"]) {
  const result =
    process.platform === "win32"
      ? spawnSync("cmd.exe", ["/d", "/s", "/c", `${command} ${args.join(" ")}`], {
          encoding: "utf8",
          shell: false,
        })
      : spawnSync(command, args, {
          encoding: "utf8",
          shell: false,
        });

  if (result.error || result.status !== 0) {
    return null;
  }

  return String(result.stdout || result.stderr).trim().split(/\r?\n/)[0];
}

function printVersion() {
  console.log(`${PKG.name} v${PKG.version}`);
}

function printTemplateList() {
  console.log(`\n  ${c.bold}Templates${c.reset}`);
  console.log(`  ${hRule(44)}`);
  console.log(`  ${A}${c.bold}php${c.reset}    ${c.white}PHP MVC authentication starter${c.reset}`);
  console.log(`  ${A}${c.bold}pern${c.reset}   ${c.white}PostgreSQL + Express + React + Node starter${c.reset}`);
  console.log(`  ${A}${c.bold}react${c.reset}  ${c.white}React app, optionally with Netlify Functions${c.reset}`);
  console.log(`\n  ${DIM}Use ${c.reset}${A}scafkit create <template> <folder>${c.reset}${DIM} or ${c.reset}${A}scafkit <template> <folder>${c.reset}${DIM}.${c.reset}\n`);
}

function printDryRunResult(template, targetDir, result) {
  const relativeFiles = result.created.map((filePath) =>
    path.relative(result.targetDir, filePath),
  );

  printSuccess(`${template} dry run`, [
    ["Target", targetDir],
    ["Files", `${relativeFiles.length} would be created`],
  ]);

  relativeFiles.slice(0, 24).forEach((filePath) => {
    console.log(`  ${DIM}${ICON.arrow}${c.reset} ${filePath}`);
  });

  if (relativeFiles.length > 24) {
    console.log(`  ${DIM}...and ${relativeFiles.length - 24} more file(s)${c.reset}`);
  }

  console.log(`\n  ${DIM}No files were written.${c.reset}\n`);
}

async function runProjectGeneratorDryRun(template, targetDir, generator) {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "scafkit-dry-run-"));
  const tempTarget = path.join(tempRoot, path.basename(targetDir));

  try {
    const result = await Promise.resolve(generator(tempTarget));
    printDryRunResult(template, targetDir, result);
  } finally {
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
}

function cdTarget(folderArg) {
  if (folderArg === ".") return ".";
  return /\s/.test(folderArg) ? `"${folderArg}"` : folderArg;
}

function printSkipped(skipped) {
  if (skipped.length > 0) {
    console.log(
      `\n  ${A3}${c.bold}${ICON.work} Skipped${c.reset} ${c.white}${skipped.length} existing file(s)${c.reset} ` +
        `${DIM}— pass ${c.reset}${A}--force${c.reset}${DIM} to overwrite.${c.reset}`,
    );
  }
}

function printNextSteps(steps, tip) {
  console.log(`\n  ${c.bold}Next steps${c.reset}`);
  console.log(`  ${hRule(44)}`);
  steps.forEach((s, i) => {
    console.log(`  ${DIM}${i + 1}.${c.reset} ${A}${s}${c.reset}`);
  });
  if (tip) {
    console.log(`\n  ${DIM}${c.italic}${tip}${c.reset}`);
  }
  console.log();
}

function printSuccess(title, fields) {
  console.log(`\n  ${A}${c.bold}✓ ${title}${c.reset}`);
  console.log(`  ${hRule(44)}`);
  fields.forEach(([label, value]) => {
    const pad = 14;
    console.log(
      `  ${DIM}${label.padEnd(pad)}${c.reset}${c.white}${value}${c.reset}`,
    );
  });
}

let oraFactoryPromise = null;

async function loadOra() {
  if (!oraFactoryPromise) {
    oraFactoryPromise = import("ora")
      .then((module) => module)
      .catch(() => null);
  }

  return oraFactoryPromise;
}

function createFallbackSpinner(text) {
  return {
    start() {
      process.stdout.write(
        `  ${A}${ICON.work}${c.reset} ${c.white}${text}${c.reset}\n`,
      );
    },
    succeed() {},
    fail() {},
    stop() {},
  };
}

function createSilentSpinner() {
  return {
    start() {},
    succeed() {},
    fail() {},
    stop() {},
  };
}

async function createSpinner(text) {
  if (!process.stdout.isTTY) {
    return createSilentSpinner();
  }

  const oraModule = await loadOra();

  if (!oraModule) {
    return createFallbackSpinner(text);
  }

  const ora = oraModule.default || oraModule;
  const dotsSpinner = oraModule.spinners?.dots || "dots";

  return ora({
    text,
    spinner: dotsSpinner,
    color: "cyan",
    isEnabled: true,
    prefixText: " ",
  });
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function withSpinner(text, task) {
  const spinner = await createSpinner(text);
  const minimumDuration = 500;
  const startedAt = Date.now();

  spinner.start();
  spinner.color = "cyan";
  spinner.text = text;

  try {
    await sleep(120);
    spinner.color = "blue";
    spinner.text = text + "...";
    const result = await task();
    const remaining = minimumDuration - (Date.now() - startedAt);

    if (remaining > 0) {
      await sleep(remaining);
    }

    if (result && result.ok === false) {
      spinner.color = "red";
      spinner.fail(text);
    } else {
      spinner.color = "green";
      spinner.succeed(text);
    }

    return result;
  } catch (error) {
    const remaining = minimumDuration - (Date.now() - startedAt);

    if (remaining > 0) {
      await sleep(remaining);
    }

    spinner.color = "red";
    spinner.fail(text);
    throw error;
  }
}

function askQuestion(rl, promptText) {
  return new Promise((resolve) => {
    rl.question(promptText, (answer) => resolve(answer.trim()));
  });
}

async function askLanguage(rl, fallback = "typescript") {
  if (!rl) return fallback;

  const answer = await askQuestion(
    rl,
    `  ${A}${c.bold}?${c.reset} Use TypeScript or JavaScript? ${DIM}[ts/js, default: ts]${c.reset} `,
  );

  if (/^(j|js|javascript)$/i.test(answer)) {
    return "javascript";
  }

  return "typescript";
}

function createPromptInterface() {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
}

function needsNpmInstall(targetDir) {
  const packageJsonPath = path.join(targetDir, "package.json");

  return (
    fs.existsSync(packageJsonPath) &&
    !fs.existsSync(path.join(targetDir, "node_modules"))
  );
}

function renderDependencyInstallChoice(details, selected) {
  const width = 68;
  const contentWidth = width - 4;
  const blue1 = c.fg(51);
  const blue2 = c.fg(45);
  const blue3 = c.fg(39);
  const blue4 = c.fg(33);
  const border = `${blue1}${c.bold}╭${blue2}${"─".repeat(width - 2)}${blue1}╮${c.reset}`;
  const bottom = `${blue1}${c.bold}╰${blue2}${"─".repeat(width - 2)}${blue1}╯${c.reset}`;
  const line = (content = "") =>
    `${blue1}${c.bold}│${c.reset} ${padAnsiRight(content, contentWidth)} ${blue3}${c.bold}│${c.reset}`;
  const divider = line(`${DIM}${"─".repeat(contentWidth)}${c.reset}`);
  const targetLine =
    details.targets.length === 1
      ? details.targets[0].label
      : details.targets.map((target) => target.label).join(", ");
  const packageManager = normalizePackageManager(details.packageManager);
  const option = (id, label, key) => {
    const active = selected === id;
    const radio = active ? "●" : "○";
    const color = active ? blue4 + c.bold : DIM;
    const keyColor = active ? blue2 + c.bold : DIM;

    return `${color}${radio} ${label}${c.reset} ${keyColor}${key}${c.reset}`;
  };
  const choices = `${option("yes", "Install now", "Y")}     ${option("no", "Skip install", "N")}`;

  const lines = [
    "",
    `  ${border}`,
    `  ${line(`${blue4}${c.bold}Install dependencies?${c.reset}`)}`,
    `  ${line(`${DIM}Run ${c.reset}${c.white}${packageManager} install${c.reset}${DIM} for ${c.reset}${c.white}${targetLine}${c.reset}`)}`,
    `  ${divider}`,
    `  ${line(choices)}`,
    `  ${line(`${DIM}← / → choose   Enter select   --yes skips this prompt${c.reset}`)}`,
    `  ${bottom}`,
  ];

  process.stdout.write(lines.join("\n"));
  return lines.length;
}

function clearRenderedPromptBlock(renderedLines) {
  if (renderedLines <= 0) {
    return;
  }

  readline.moveCursor(process.stdout, 0, -(renderedLines - 1));
  readline.cursorTo(process.stdout, 0);
  readline.clearScreenDown(process.stdout);
}

function askDependencyInstallConfirmation(rl, details) {
  return new Promise((resolve) => {
    let selected = "yes";
    let renderedLines = 0;
    const wasRaw = process.stdin.isRaw;

    function cleanup(answer) {
      process.stdin.off("keypress", onKeypress);
      if (process.stdin.isTTY) {
        process.stdin.setRawMode(Boolean(wasRaw));
      }
      rl.resume();
      process.stdout.write("\n");
      resolve(answer);
    }

    function redraw() {
      clearRenderedPromptBlock(renderedLines);
      renderedLines = renderDependencyInstallChoice(details, selected);
    }

    function onKeypress(str, key = {}) {
      if (key.name === "left" || key.name === "right") {
        selected = selected === "yes" ? "no" : "yes";
        redraw();
        return;
      }

      if (key.name === "return") {
        cleanup(selected === "yes");
        return;
      }

      if (key.name === "y") {
        cleanup(true);
        return;
      }

      if (key.name === "n" || key.name === "escape") {
        cleanup(false);
        return;
      }

      if (key.ctrl && key.name === "c") {
        cleanup(false);
      }
    }

    rl.pause();
    readline.emitKeypressEvents(process.stdin);
    if (process.stdin.isTTY) {
      process.stdin.setRawMode(true);
    }
    process.stdin.on("keypress", onKeypress);
    process.stdin.resume();
    redraw();
  });
}

async function confirmDependencyInstall({
  rl,
  yes,
  install,
  packageManager = "npm",
  targets,
}) {
  const installTargets = targets.filter((target) => needsNpmInstall(target.dir));

  if (!install) {
    return false;
  }

  if (yes || installTargets.length === 0) {
    return true;
  }

  const promptRl = rl || createPromptInterface();
  const shouldInstall = await askDependencyInstallConfirmation(promptRl, {
    packageManager: normalizePackageManager(packageManager),
    targets: installTargets,
  });

  if (!rl) {
    promptRl.close();
  }

  return shouldInstall;
}

async function runCommand(command, args, options = {}) {
  const { spinnerText, capture = false, ...spawnOptions } = options;
  const spinner = spinnerText ? await createSpinner(spinnerText) : null;
  const stdio = spinner || capture ? ["ignore", "pipe", "pipe"] : "inherit";

  return new Promise((resolve) => {
    let stdout = "";
    let stderr = "";

    if (spinner) {
      spinner.start();
    }

    const child = spawn(command, args, {
      stdio,
      shell: false,
      ...spawnOptions,
    });

    if (child.stdout) {
      child.stdout.on("data", (chunk) => {
        stdout += chunk.toString();
      });
    }

    if (child.stderr) {
      child.stderr.on("data", (chunk) => {
        stderr += chunk.toString();
      });
    }

    child.on("error", (error) => {
      if (spinner) {
        spinner.stop("fail");
      }

      resolve({
        ok: false,
        message: error.message,
        status: null,
        stdout,
        stderr,
      });
    });

    child.on("close", (status) => {
      if (spinner) {
        spinner.stop(status === 0 ? "done" : "fail");
      }

      if (spinner && status !== 0 && stderr.trim()) {
        console.log(`  ${DIM}${stderr.trim()}${c.reset}`);
      }

      resolve({
        ok: status === 0,
        message:
          status === 0
            ? "Command completed"
            : `${command} exited with code ${status}`,
        status,
        stdout,
        stderr,
      });
    });
  });
}

function npmCommand(args, cwd, options = {}) {
  if (process.platform === "win32") {
    return runCommand("cmd.exe", ["/d", "/s", "/c", `npm ${args.join(" ")}`], {
      cwd,
      ...options,
    });
  }

  return runCommand("npm", args, { cwd, ...options });
}

async function ensurePackageDependencies(targetDir, packageManager = "npm") {
  const packageJsonPath = path.join(targetDir, "package.json");
  const pm = normalizePackageManager(packageManager);

  if (!fs.existsSync(packageJsonPath)) {
    return { ok: false, message: "No package.json found" };
  }

  if (fs.existsSync(path.join(targetDir, "node_modules"))) {
    return { ok: true, message: "Dependencies already installed" };
  }

  console.log(`\n  ${DIM}${targetDir}${c.reset}`);
  const result = await packageManagerCommand(
    pm,
    packageManagerArgs(pm, "install"),
    targetDir,
    { spinnerText: `Installing dependencies with ${pm}` },
  );

  return result.ok
    ? { ...result, message: `Installed with ${pm}` }
    : result;
}

async function ensureNpmDependencies(targetDir) {
  return ensurePackageDependencies(targetDir, detectPackageManager(targetDir));
}

async function installDevPackages(targetDir, packages, packageManager = "npm") {
  const pm = normalizePackageManager(packageManager);
  const missing = packages.filter((packageName) => {
    const packagePath = packageName.startsWith("@")
      ? path.join(targetDir, "node_modules", ...packageName.split("/"))
      : path.join(targetDir, "node_modules", packageName);
    return !fs.existsSync(packagePath);
  });

  if (missing.length === 0) {
    return { ok: true, message: "Dev tools already installed" };
  }

  console.log(`  ${DIM}${missing.join(", ")}${c.reset}`);
  const result = await packageManagerCommand(
    pm,
    packageManagerArgs(pm, "addDev", missing),
    targetDir,
    { spinnerText: `Installing dev tools with ${pm}` },
  );

  return result.ok
    ? { ...result, message: `Installed with ${pm}` }
    : result;
}

async function ensureTailwindDependencies(targetDir, packageManager = "npm") {
  return installDevPackages(
    targetDir,
    ["tailwindcss", "@tailwindcss/vite"],
    packageManager,
  );
}

function copyEnvExample(targetDir) {
  const source = path.join(targetDir, ".env.example");
  const destination = path.join(targetDir, ".env");

  if (fs.existsSync(source) && !fs.existsSync(destination)) {
    fs.copyFileSync(source, destination);
  }
}

function runNpmInstall(targetDir) {
  console.log(
    `\n  ${A}${c.bold}${ICON.work} Installing dependencies${c.reset}`,
  );
  console.log(`  ${DIM}${targetDir}${c.reset}`);

  const result =
    process.platform === "win32"
      ? spawnSync(
          "cmd.exe",
          ["/d", "/s", "/c", "npm install --loglevel=error"],
          {
            cwd: targetDir,
            stdio: "inherit",
            shell: false,
          },
        )
      : spawnSync("npm", ["install", "--loglevel=error"], {
          cwd: targetDir,
          stdio: "inherit",
          shell: false,
        });

  if (result.error) {
    return {
      ok: false,
      message: result.error.message,
    };
  }

  if (result.status !== 0) {
    return {
      ok: false,
      message: "npm install failed with exit code " + result.status,
    };
  }

  return {
    ok: true,
    message: "Dependencies installed",
  };
}

async function handlePern(args, rl) {
  const {
    folderArg,
    outputDir,
    force,
    help: showHelp,
    yes,
    install,
    dryRun,
    sequelize,
    sequelizeDialect,
    tailwind,
    language,
    packageManager,
  } = parseProjectArgs(args);
  if (showHelp) {
    help("pern");
    return;
  }

  const targetDir = resolveTargetDir(folderArg, outputDir);
  try {
    const selectedLanguage = language || (yes ? "typescript" : await askLanguage(rl));

    if (dryRun) {
      await runProjectGeneratorDryRun("PERN starter", targetDir, (previewDir) =>
        generatePernProject({
          targetDir: previewDir,
          force,
          sequelize,
          sequelizeDialect,
          tailwind,
          language: selectedLanguage,
        }),
      );
      return;
    }

    const result = await withSpinner("Generating PERN project", () =>
      Promise.resolve(
        generatePernProject({
          targetDir,
          force,
          sequelize,
          sequelizeDialect,
          tailwind,
          language: selectedLanguage,
        }),
      ),
    );
    copyEnvExample(path.join(result.targetDir, "server"));
    const clientDir = path.join(result.targetDir, "client");
    const serverDir = path.join(result.targetDir, "server");
    const shouldInstallDependencies = await confirmDependencyInstall({
      rl,
      yes,
      install,
      packageManager,
      targets: [
        { label: "React client", dir: clientDir },
        { label: "Express server", dir: serverDir },
      ],
    });
    const clientInstall = shouldInstallDependencies
      ? await ensurePackageDependencies(clientDir, packageManager)
      : { ok: true, message: install ? "Skipped by user" : "Skipped by --no-install" };
    const serverInstall = shouldInstallDependencies
      ? await ensurePackageDependencies(serverDir, packageManager)
      : { ok: true, message: install ? "Skipped by user" : "Skipped by --no-install" };
    const tailwindInstall =
      tailwind && shouldInstallDependencies
        ? await ensureTailwindDependencies(clientDir, packageManager)
        : {
            ok: true,
            message: tailwind
              ? install
                ? "Skipped by user"
                : "Skipped by --no-install"
              : "Not included",
          };

    if (!tailwindInstall.ok) {
      printError("Tailwind install failed", tailwindInstall.message);
      return;
    }

    const databaseLabel = sequelizeDialect
      ? `Sequelize + ${sequelizeDialect}`
      : "pg Pool + PostgreSQL";
    printSuccess("PERN starter created", [
      ["Target", result.targetDir],
      ["Files", `${result.created.length} created`],
      ["Language", selectedLanguage],
      ["Package manager", packageManager],
      ["Database", databaseLabel],
      ["Tailwind", tailwind ? tailwindInstall.message : "Not included"],
      ["Client install", clientInstall.message],
      ["Server install", serverInstall.message],
    ]);
    printSkipped(result.skipped);
    printNextSteps(
      [
        `cd ${cdTarget(folderArg)}`,
        ".env was copied for the server when missing",
        "edit .env  <- add your PostgreSQL connection",
        "scafkit run        opens the React client",
        "scafkit server/src/index." +
          (selectedLanguage === "javascript" ? "js" : "ts") +
          "        opens the Express API",
      ],
      "Run  help pern  for the full options reference.",
    );
  } catch (err) {
    printError("PERN generation failed", err.message);
  }
}

async function handleReact(args, rl) {
  const {
    folderArg,
    outputDir,
    force,
    help: showHelp,
    yes,
    install,
    dryRun,
    serverless,
    tailwind,
    language,
    packageManager,
  } = parseProjectArgs(args);
  if (showHelp) {
    help("react");
    return;
  }

  const targetDir = resolveTargetDir(folderArg, outputDir);
  try {
    const selectedLanguage = language || (yes ? "typescript" : await askLanguage(rl));

    if (dryRun) {
      await runProjectGeneratorDryRun("React starter", targetDir, (previewDir) =>
        generateReactProject({
          targetDir: previewDir,
          force,
          serverless,
          tailwind,
          language: selectedLanguage,
        }),
      );
      return;
    }

    const result = await withSpinner("Generating React project", () =>
      Promise.resolve(
        generateReactProject({
          targetDir,
          force,
          serverless,
          tailwind,
          language: selectedLanguage,
        }),
      ),
    );
    const shouldInstallDependencies = await confirmDependencyInstall({
      rl,
      yes,
      install,
      packageManager,
      targets: [{ label: "React app", dir: result.targetDir }],
    });
    const installResult = shouldInstallDependencies
      ? await ensurePackageDependencies(result.targetDir, packageManager)
      : { ok: true, message: install ? "Skipped by user" : "Skipped by --no-install" };
    const tailwindInstall =
      tailwind && shouldInstallDependencies
        ? await ensureTailwindDependencies(result.targetDir, packageManager)
        : {
            ok: true,
            message: tailwind
              ? install
                ? "Skipped by user"
                : "Skipped by --no-install"
              : "Not included",
          };

    if (!tailwindInstall.ok) {
      printError("Tailwind install failed", tailwindInstall.message);
      return;
    }

    printSuccess("React starter created", [
      ["Target", result.targetDir],
      ["Files", `${result.created.length} created`],
      ["Language", selectedLanguage],
      ["Package manager", packageManager],
      ["Mode", serverless ? "Netlify serverless web app" : "Frontend only"],
      ["Tailwind", tailwind ? tailwindInstall.message : "Not included"],
      ["Install", installResult.message],
    ]);
    printSkipped(result.skipped);
    printNextSteps(
      [
        `cd ${cdTarget(folderArg)}`,
        "scafkit run",
        `${packageManager} run build`,
      ],
      "Run  help react  for the full options reference.",
    );
  } catch (err) {
    printError("React generation failed", err.message);
  }
}

async function handlePhp(args) {
  const {
    folderArg,
    outputDir,
    force,
    help: showHelp,
    dryRun,
    tailwind,
    bootstrap,
  } = parseProjectArgs(args);
  if (showHelp) {
    help("php");
    return;
  }

  if (tailwind && bootstrap) {
    printError(
      "Choose one CSS framework",
      "Use either --tw for Tailwind, --bs for Bootstrap, or no flag for regular CSS.",
    );
    return;
  }

  const cssFramework = tailwind ? "tailwind" : bootstrap ? "bootstrap" : "css";
  const targetDir = resolveTargetDir(folderArg, outputDir);
  try {
    if (dryRun) {
      await runProjectGeneratorDryRun("PHP starter", targetDir, (previewDir) =>
        generatePhpProject({ targetDir: previewDir, force, cssFramework }),
      );
      return;
    }

    const result = await withSpinner("Generating PHP project", () =>
      Promise.resolve(generatePhpProject({ targetDir, force, cssFramework })),
    );
    printSuccess("PHP starter created", [
      ["Target", result.targetDir],
      ["Files", `${result.created.length} created`],
      ["CSS", cssFramework],
    ]);
    printSkipped(result.skipped);
    printNextSteps(
      [`cd ${cdTarget(folderArg)}`, "cp .env.example .env", "scafkit run php"],
      "Run  help php  for the full options reference.",
    );
  } catch (err) {
    printError("PHP generation failed", err.message);
  }
}

async function handleMakeController(args) {
  if (args.includes("--help") || args.includes("-h")) {
    help("php");
    return;
  }

  const force = args.includes("--force") || args.includes("-f");
  const positionals = args.filter((arg) => !arg.startsWith("-"));
  const controllerName = positionals[0];
  const actions = positionals.slice(1);

  if (!controllerName) {
    printError(
      "Controller name required",
      "Use: scafkit make:controller ControllerName methodOne methodTwo",
    );
    return;
  }

  try {
    const result = await withSpinner("Creating PHP controller", () =>
      Promise.resolve(
        generatePhpController({
          targetDir: process.cwd(),
          name: controllerName,
          actions,
          force,
        }),
      ),
    );
    printSuccess("PHP controller created", [
      ["Target", result.targetDir],
      ["Files", `${result.created.length} created`],
      ["Controller", result.controller],
      ["Actions", result.actions.join(", ")],
    ]);
    printSkipped(result.skipped);
  } catch (err) {
    printError("PHP controller generation failed", err.message);
  }
}

async function handleMakeRoute(args) {
  if (args.includes("--help") || args.includes("-h")) {
    help("php");
    return;
  }

  const force = args.includes("--force") || args.includes("-f");
  let method = "GET";
  const positionals = [];

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];

    if (arg === "--force" || arg === "-f") {
      continue;
    }

    if (arg === "--method" || arg === "-m") {
      method = args[i + 1] || method;
      i += 1;
      continue;
    }

    if (arg.startsWith("--method=")) {
      method = arg.slice("--method=".length);
      continue;
    }

    if (!arg.startsWith("-")) {
      positionals.push(arg);
    }
  }

  if (["GET", "POST", "PUT", "PATCH", "DELETE"].includes(String(positionals[0] || "").toUpperCase())) {
    method = positionals.shift();
  }

  const routePath = positionals[0];
  const handler = positionals[1];

  if (!routePath || !handler) {
    printError(
      "Route path and handler required",
      "Use: scafkit make:route GET /dashboard DashboardController@index",
    );
    return;
  }

  try {
    const result = await withSpinner("Creating PHP route", () =>
      Promise.resolve(
        generatePhpRoute({
          targetDir: process.cwd(),
          routePath,
          handler,
          method,
          force,
        }),
      ),
    );
    printSuccess("PHP route created", [
      ["Target", result.targetDir],
      ["Files", `${result.created.length} changed`],
      ["Route", `${result.method} ${result.route}`],
      ["Handler", result.handler],
      ["Controller", result.controller],
      ["Model", result.model],
      ["View", result.view],
    ]);
    printSkipped(result.skipped);
  } catch (err) {
    printError("PHP route generation failed", err.message);
  }
}

async function handleCreate(args, rl) {
  const template = args[0] && args[0].toLowerCase();

  if (!template || args.includes("--help") || args.includes("-h")) {
    console.log(`\n  ${A}${c.bold}Create a starter${c.reset}`);
    console.log(`  ${hRule(44)}`);
    console.log(`  ${A}scafkit create react my-app --tw --yes${c.reset}`);
    console.log(`  ${A}scafkit create pern api-app --sq-pg --dir ../projects${c.reset}`);
    console.log(`  ${A}scafkit create php auth-app --dry-run${c.reset}\n`);
    printTemplateList();
    return;
  }

  const rest = args.slice(1);

  if (template === "react") {
    await handleReact(rest, rl);
    return;
  }

  if (template === "pern") {
    await handlePern(rest, rl);
    return;
  }

  if (template === "php") {
    await handlePhp(rest);
    return;
  }

  printError(
    "Unknown template",
    `Use one of: react, pern, php. Received: ${template}`,
  );
}

function printError(title, message) {
  console.log(`\n  ${c.bRed}${c.bold}${ICON.fail} ${title}${c.reset}`);
  console.log(`  ${hRule(44, c.bRed)}`);
  console.log(`  ${c.white}${message}${c.reset}\n`);
}

const managedServers = new Map();
let managedServerCounter = 0;

function getNpmRunCommand(scriptName) {
  if (process.platform === "win32") {
    return {
      command: "cmd.exe",
      args: ["/d", "/s", "/c", `npm run ${scriptName}`],
    };
  }

  return {
    command: "npm",
    args: ["run", scriptName],
  };
}

function createServerId(kind) {
  managedServerCounter += 1;
  return `${kind}-${managedServerCounter}`;
}

function isManagedServerActive(server) {
  return Boolean(
    server.child && server.child.exitCode === null && !server.exited,
  );
}

function startManagedServer(config) {
  const existing = Array.from(managedServers.values()).find(
    (server) =>
      server.kind === config.kind &&
      server.cwd === config.cwd &&
      isManagedServerActive(server),
  );

  if (existing) {
    return existing;
  }

  const id = createServerId(config.kind);
  const child = spawn(config.command, config.args, {
    cwd: config.cwd,
    stdio: ["ignore", "pipe", "pipe"],
    shell: false,
    env: {
      ...process.env,
      BROWSER: "none",
    },
  });

  const server = {
    id,
    kind: config.kind,
    label: config.label,
    url: config.url,
    cwd: config.cwd,
    commandText: config.commandText,
    child,
    exited: false,
    exitCode: null,
    lastError: "",
    external: false,
    checkStatus: config.checkStatus,
  };

  child.stdout?.on("data", (chunk) => {
    const text = chunk.toString().trim();
    if (text) server.lastOutput = text.split(/\r?\n/).slice(-1)[0];
  });

  child.stderr?.on("data", (chunk) => {
    const text = chunk.toString().trim();
    if (text) server.lastError = text.split(/\r?\n/).slice(-1)[0];
  });

  child.on("error", (error) => {
    server.exited = true;
    server.lastError = error.message;
  });

  child.on("exit", (code) => {
    server.exited = true;
    server.exitCode = code;
  });

  managedServers.set(id, server);
  return server;
}

function createExternalServer(config) {
  const existing = Array.from(managedServers.values()).find(
    (server) => server.kind === config.kind && server.cwd === config.cwd,
  );

  if (existing) {
    existing.url = config.url;
    existing.checkStatus = config.checkStatus;
    return existing;
  }

  const id = createServerId(config.kind);
  const server = {
    id,
    kind: config.kind,
    label: config.label,
    url: config.url,
    cwd: config.cwd,
    commandText: config.commandText,
    child: null,
    exited: false,
    exitCode: null,
    lastError: "",
    external: true,
    checkStatus: config.checkStatus,
  };

  managedServers.set(id, server);
  return server;
}

function stopManagedServer(server) {
  if (!server || server.external) return false;
  if (!isManagedServerActive(server)) return false;

  if (process.platform === "win32") {
    spawnSync("taskkill", ["/pid", String(server.child.pid), "/T", "/F"], {
      stdio: "ignore",
      shell: false,
    });
  } else {
    server.child.kill("SIGTERM");
  }

  server.exited = true;
  return true;
}

function stopAllManagedServers() {
  for (const server of managedServers.values()) {
    stopManagedServer(server);
  }
}

function canConnectHost(port, host, timeout = 350) {
  return new Promise((resolve) => {
    const net = require("net");
    const socket = net.createConnection({ host, port });
    let settled = false;

    function done(value) {
      if (settled) return;
      settled = true;
      socket.destroy();
      resolve(value);
    }

    socket.setTimeout(timeout);
    socket.on("connect", () => done(true));
    socket.on("timeout", () => done(false));
    socket.on("error", () => done(false));
  });
}

async function canConnect(port, host = null, timeout = 350) {
  const hosts = host ? [host] : ["127.0.0.1", "::1", "localhost"];

  for (const candidate of hosts) {
    if (await canConnectHost(port, candidate, timeout)) {
      return true;
    }
  }

  return false;
}

async function canConnectWithRetry(port, attempts = 6, delay = 350) {
  for (let index = 0; index < attempts; index += 1) {
    if (await canConnect(port)) {
      return true;
    }

    if (index < attempts - 1) {
      await sleep(delay);
    }
  }

  return false;
}

async function getServerStatus(server) {
  if (server.external && server.checkStatus) {
    return (await server.checkStatus()) ? "active" : "inactive";
  }

  if (server.checkStatus) {
    if (await server.checkStatus()) {
      return "active";
    }

    return isManagedServerActive(server) && !server.lastError
      ? "active"
      : "inactive";
  }

  return isManagedServerActive(server) ? "active" : "inactive";
}

async function printServerStatus(
  servers = Array.from(managedServers.values()),
) {
  if (servers.length === 0) {
    console.log(`\n  ${DIM}No servers are being tracked.${c.reset}\n`);
    return;
  }

  console.log(`\n  ${A}${c.bold}${ICON.work} Server status${c.reset}`);
  console.log(`  ${hRule(58)}`);

  const statuses = await withSpinner("Checking server status", async () => {
    const results = [];
    for (const server of servers) {
      results.push([server, await getServerStatus(server)]);
    }
    return results;
  });

  for (const [server, status] of statuses) {
    const color = status === "active" ? c.green : c.bBlack;
    console.log(
      `  ${A}${server.id.padEnd(10)}${c.reset} ${c.white}${server.label.padEnd(16)}${c.reset} ${color}${status}${c.reset}`,
    );
    console.log(`  ${DIM}${server.url}${c.reset}`);
    if (server.lastError && status !== "active") {
      console.log(`  ${c.bRed}${server.lastError}${c.reset}`);
    }
  }

  console.log(
    `\n  ${DIM}Use ${c.reset}${A}status${c.reset}${DIM}, ${c.reset}${A}stop <id>${c.reset}${DIM}, or ${c.reset}${A}stop all${c.reset}${DIM}.${c.reset}\n`,
  );
}

async function handleStatus() {
  await printServerStatus();
}

function handleStop(args) {
  const target = (args[0] || "").toLowerCase();
  const servers =
    target === "all"
      ? Array.from(managedServers.values())
      : Array.from(managedServers.values()).filter(
          (server) => server.id.toLowerCase() === target,
        );

  if (target === "all" && servers.length === 0) {
    console.log(`\n  ${DIM}No servers are being tracked.${c.reset}\n`);
    return;
  }

  if (!target || servers.length === 0) {
    printError("Server not found", "Use status to view tracked server ids.");
    return;
  }

  let stopped = 0;
  for (const server of servers) {
    if (stopManagedServer(server)) stopped += 1;
  }

  console.log(
    `\n  ${A}${ICON.arrow}${c.reset} ${stopped} server(s) stopped. External servers like XAMPP must be stopped in their own app.\n`,
  );
}

function runNpmCommand(args, options = {}) {
  if (process.platform === "win32") {
    return spawnSync("cmd.exe", ["/d", "/s", "/c", `npm ${args.join(" ")}`], {
      ...options,
      shell: false,
    });
  }

  return spawnSync("npm", args, {
    ...options,
    shell: false,
  });
}

function printCheckRows(title, rows) {
  console.log(`\n  ${A}${c.bold}${ICON.work} ${title}${c.reset}`);
  console.log(`  ${hRule(58)}`);
  rows.forEach(([label, value, ok = true]) => {
    const color = ok ? c.white : A3;
    console.log(`  ${DIM}${label.padEnd(28)}${c.reset}${color}${value}${c.reset}`);
  });
  console.log();
}

async function handleDoctor() {
  const diagnostics = await withSpinner("Running diagnostics", async () => {
    let latest = "Not checked";

    try {
      latest = await getLatestPackageVersion({ spinner: false });
    } catch {
      latest = "Unable to reach npm registry";
    }

    return {
      latest,
      nodeVersion: process.version,
      npmVersion: commandVersion("npm") || "Not found",
      gitVersion: commandVersion("git", ["--version"]) || "Not found",
      phpVersion: commandVersion("php", ["-v"]) || "Not found",
      composerVersion: commandVersion("composer", ["--version"]) || "Not found",
      packageManagers: ["pnpm", "yarn", "bun"]
        .map((pm) => `${pm}: ${commandVersion(pm) || "not found"}`)
        .join("  "),
    };
  });

  printCheckRows("Scafkit doctor", [
    ["Scafkit", `${PKG.version} (latest: ${diagnostics.latest})`],
    ["Node", diagnostics.nodeVersion],
    ["npm", diagnostics.npmVersion, diagnostics.npmVersion !== "Not found"],
    ["Git", diagnostics.gitVersion, diagnostics.gitVersion !== "Not found"],
    ["PHP", diagnostics.phpVersion, diagnostics.phpVersion !== "Not found"],
    [
      "Composer",
      diagnostics.composerVersion,
      diagnostics.composerVersion !== "Not found",
    ],
    ["Other PMs", diagnostics.packageManagers],
  ]);
}

async function handleInspect() {
  const project = await withSpinner("Inspecting project", () =>
    Promise.resolve(detectProjectKind(process.cwd())),
  );

  if (!project) {
    printError(
      "Project not detected",
      "Run inspect inside a generated React, PERN, PHP, or Node project.",
    );
    return;
  }

  const rows = [["Type", project.kind], ["Root", project.rootDir]];

  if (project.kind === "PERN") {
    rows.push(
      ["Client", project.clientDir],
      ["Server", project.serverDir],
      ["Client PM", detectPackageManager(project.clientDir)],
      ["Server PM", detectPackageManager(project.serverDir)],
    );
    printCheckRows("Project inspect", [
      ...rows,
      ...packageScriptRows(project.clientDir, "client"),
      ...packageScriptRows(project.serverDir, "server"),
    ]);
    return;
  }

  if (project.packageDir) {
    rows.push(
      ["Package", project.packageJson?.name || path.basename(project.packageDir)],
      ["Package manager", detectPackageManager(project.packageDir)],
    );
    printCheckRows("Project inspect", [
      ...rows,
      ...packageScriptRows(project.packageDir, "script"),
    ]);
    return;
  }

  printCheckRows("Project inspect", [
    ...rows,
    ["Run", "scafkit run php"],
  ]);
}

function compareVersions(left, right) {
  const leftParts = String(left)
    .split(/[.-]/)
    .map((part) => Number(part) || 0);
  const rightParts = String(right)
    .split(/[.-]/)
    .map((part) => Number(part) || 0);
  const length = Math.max(leftParts.length, rightParts.length);

  for (let index = 0; index < length; index += 1) {
    const leftPart = leftParts[index] || 0;
    const rightPart = rightParts[index] || 0;

    if (leftPart > rightPart) return 1;
    if (leftPart < rightPart) return -1;
  }

  return 0;
}

async function getLatestPackageVersion(options = {}) {
  const spinnerText =
    options.spinner === false ? null : "Checking for updates";
  const result = await npmCommand(
    ["view", PKG.name, "version", "--loglevel=error"],
    process.cwd(),
    spinnerText ? { spinnerText } : { capture: true },
  );

  if (!result.ok) {
    throw new Error((result.stderr || "Unable to check npm registry.").trim());
  }

  return result.stdout.trim();
}

function renderUpdateChoice(details, selected) {
  const width = 58;
  const contentWidth = width - 4;
  const blue1 = c.fg(51);
  const blue2 = c.fg(45);
  const blue3 = c.fg(39);
  const blue4 = c.fg(33);
  const border = `${blue1}${c.bold}╭${blue2}${"─".repeat(width - 2)}${blue1}╮${c.reset}`;
  const bottom = `${blue1}${c.bold}╰${blue2}${"─".repeat(width - 2)}${blue1}╯${c.reset}`;
  const line = (content = "") =>
    `${blue1}${c.bold}│${c.reset} ${padAnsiRight(content, contentWidth)} ${blue3}${c.bold}│${c.reset}`;
  const divider = line(`${DIM}${"-".repeat(contentWidth)}${c.reset}`);
  const option = (id, label, key) => {
    const active = selected === id;
    const radio = active ? "●" : "○";
    const color = active ? blue4 + c.bold : DIM;
    const keyColor = active ? blue2 + c.bold : DIM;

    return `${color}${radio} ${label}${c.reset} ${keyColor}${key}${c.reset}`;
  };

  const lines = [
    "",
    `  ${border}`,
    `  ${line(`${blue4}${c.bold}Update available${c.reset}`)}`,
    `  ${line(`${DIM}${PKG.name}${c.reset}`)}`,
    `  ${line(`${c.white}${details.current}${c.reset} ${DIM}->${c.reset} ${blue4}${c.bold}${details.latest}${c.reset}`)}`,
    `  ${divider}`,
    `  ${line(`${option("yes", "Install update", "Y")}    ${option("no", "Skip for now", "N")}`)}`,
    `  ${line(`${DIM}Use left/right arrows, then Enter.${c.reset}`)}`,
    `  ${bottom}`,
  ];

  process.stdout.write(lines.join("\n"));
  return lines.length;
}

function askUpdateConfirmation(rl, details) {
  return new Promise((resolve) => {
    let selected = "yes";
    let renderedLines = 0;
    const wasRaw = process.stdin.isRaw;

    function cleanup(answer) {
      process.stdin.off("keypress", onKeypress);
      if (process.stdin.isTTY) {
        process.stdin.setRawMode(Boolean(wasRaw));
      }
      rl.resume();
      process.stdout.write("\n");
      resolve(answer);
    }

    function redraw() {
      clearRenderedPromptBlock(renderedLines);
      renderedLines = renderUpdateChoice(details, selected);
    }

    function onKeypress(str, key = {}) {
      if (key.name === "left" || key.name === "right") {
        selected = selected === "yes" ? "no" : "yes";
        redraw();
        return;
      }

      if (key.name === "return") {
        cleanup(selected === "yes");
        return;
      }

      if (key.name === "y") {
        cleanup(true);
        return;
      }

      if (key.name === "n" || key.name === "escape") {
        cleanup(false);
        return;
      }

      if (key.ctrl && key.name === "c") {
        cleanup(false);
      }
    }

    rl.pause();
    readline.emitKeypressEvents(process.stdin);
    if (process.stdin.isTTY) {
      process.stdin.setRawMode(true);
    }
    process.stdin.on("keypress", onKeypress);
    process.stdin.resume();
    redraw();
  });
}

async function handleUpdate(args = [], rl) {
  try {
    const checkOnly = args.includes("--check") || args.includes("-c");
    const latest = await getLatestPackageVersion();
    const isCurrent = compareVersions(PKG.version, latest) >= 0;

    if (checkOnly) {
      printSuccess(isCurrent ? "CLI is up to date" : "CLI update available", [
        ["Package", PKG.name],
        ["Current", PKG.version],
        ["Latest", latest],
      ]);
      return;
    }

    if (isCurrent) {
      printSuccess("CLI is up to date", [
        ["Package", PKG.name],
        ["Current", PKG.version],
      ]);
      return;
    }

    const updateRl =
      rl ||
      readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });

    const shouldUpdate = await askUpdateConfirmation(updateRl, {
      current: PKG.version,
      latest,
    });

    if (!rl) {
      updateRl.close();
    }

    if (!shouldUpdate) {
      console.log(`  ${DIM}Update cancelled.${c.reset}\n`);
      return;
    }

    const result = await npmCommand(
      ["install", "-g", `${PKG.name}@${latest}`, "--loglevel=error"],
      process.cwd(),
      { spinnerText: `Installing ${PKG.name}@${latest}` },
    );

    if (!result.ok) {
      throw new Error(result.stderr.trim() || result.message);
    }

    printSuccess("CLI updated", [
      ["Package", PKG.name],
      ["Version", latest],
    ]);
  } catch (err) {
    printError("Update failed", err.message);
  }
}

function handleCd(args) {
  const target = args[0];

  if (!target) {
    console.log(`  ${A}${ICON.arrow}${c.reset} ${process.cwd()}`);
    return;
  }

  const nextDir = path.resolve(process.cwd(), target);

  if (!fs.existsSync(nextDir) || !fs.statSync(nextDir).isDirectory()) {
    printError("Directory not found", nextDir);
    return;
  }

  process.chdir(nextDir);
  console.log(`  ${A}${ICON.arrow}${c.reset} ${process.cwd()}`);
}

function findRunnableProjectDir(startDir) {
  if (fs.existsSync(path.join(startDir, "package.json"))) {
    return startDir;
  }

  const clientDir = path.join(startDir, "client");

  if (fs.existsSync(path.join(clientDir, "package.json"))) {
    return clientDir;
  }

  return null;
}

function findPernProjectDirs(startDir) {
  const directClient = path.join(startDir, "client");
  const directServer = path.join(startDir, "server");

  if (
    fs.existsSync(path.join(directClient, "package.json")) &&
    fs.existsSync(path.join(directServer, "package.json"))
  ) {
    return {
      rootDir: startDir,
      clientDir: directClient,
      serverDir: directServer,
    };
  }

  const parentDir = path.dirname(startDir);
  const parentClient = path.join(parentDir, "client");
  const parentServer = path.join(parentDir, "server");

  if (
    fs.existsSync(path.join(parentClient, "package.json")) &&
    fs.existsSync(path.join(parentServer, "package.json"))
  ) {
    return {
      rootDir: parentDir,
      clientDir: parentClient,
      serverDir: parentServer,
    };
  }

  return null;
}

function readPackageJson(projectDir) {
  const packageJsonPath = path.join(projectDir, "package.json");

  if (!fs.existsSync(packageJsonPath)) {
    return null;
  }

  try {
    return JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
  } catch {
    return null;
  }
}

function packageScriptRows(projectDir, label) {
  const packageJson = readPackageJson(projectDir);
  const scripts = packageJson?.scripts || {};
  const entries = Object.keys(scripts);

  if (entries.length === 0) {
    return [[label, "No scripts found"]];
  }

  return entries.map((name) => [
    `${label}:${name}`,
    `${detectPackageManager(projectDir)} run ${name}`,
  ]);
}

function detectProjectKind(startDir) {
  const pernDirs = findPernProjectDirs(startDir);

  if (pernDirs) {
    return { kind: "PERN", ...pernDirs };
  }

  const packageDir = findRunnableProjectDir(startDir) || findNearestPackageDir(startDir);
  if (packageDir) {
    const packageJson = readPackageJson(packageDir);
    const deps = {
      ...packageJson?.dependencies,
      ...packageJson?.devDependencies,
    };

    return {
      kind: deps.react ? "React" : "Node",
      rootDir: packageDir,
      packageDir,
      packageJson,
    };
  }

  if (
    fs.existsSync(path.join(startDir, "public", "index.php")) ||
    fs.existsSync(path.join(startDir, "app", "Controllers"))
  ) {
    return { kind: "PHP MVC", rootDir: startDir };
  }

  return null;
}

function findNearestPackageDir(startDir) {
  let current = startDir;

  while (current && current !== path.dirname(current)) {
    if (fs.existsSync(path.join(current, "package.json"))) {
      return current;
    }

    current = path.dirname(current);
  }

  return null;
}

async function runPackageProject(projectDir) {
  const packageJson = JSON.parse(
    fs.readFileSync(path.join(projectDir, "package.json"), "utf8"),
  );
  const scripts = packageJson.scripts || {};
  const scriptName = scripts["netlify:dev"]
    ? "netlify:dev"
    : scripts.dev
      ? "dev"
      : null;

  if (!scriptName) {
    printError(
      "No runnable npm script",
      "Expected a dev or netlify:dev script in package.json.",
    );
    return;
  }

  const installResult = await ensureNpmDependencies(projectDir);

  if (!installResult.ok) {
    printError("Dependency install failed", installResult.message);
    return;
  }

  const port = scriptName === "netlify:dev" ? 8888 : 5173;
  const runner = getNpmRunCommand(scriptName);
  const server = startManagedServer({
    kind: "react",
    label: "React client",
    url: `http://localhost:${port}`,
    cwd: projectDir,
    command: runner.command,
    args: runner.args,
    commandText: `npm run ${scriptName}`,
    checkStatus: () => canConnectWithRetry(port),
  });

  console.log(`\n  ${A}${c.bold}${ICON.work} React server${c.reset}`);
  console.log(`  ${DIM}${projectDir}${c.reset}`);
  console.log(`  ${A}${ICON.arrow}${c.reset} ${server.url}`);
  await sleep(900);
  await printServerStatus([server]);
}

function existingDirectories(candidates) {
  return candidates.filter((candidate) => {
    try {
      return fs.existsSync(candidate) && fs.statSync(candidate).isDirectory();
    } catch {
      return false;
    }
  });
}

function getWindowsDriveRoots() {
  const roots = [];

  for (let code = 65; code <= 90; code += 1) {
    const root = `${String.fromCharCode(code)}:\\`;
    if (fs.existsSync(root)) {
      roots.push(root);
    }
  }

  return roots;
}

function findExecutableOnPath(executableName) {
  const pathExt =
    process.platform === "win32" ? ["", ".exe", ".bat", ".cmd"] : [""];
  const pathDirs = String(process.env.PATH || "")
    .split(path.delimiter)
    .filter(Boolean);

  for (const dir of pathDirs) {
    for (const ext of pathExt) {
      const candidate = path.join(dir, executableName + ext);
      if (fs.existsSync(candidate)) {
        return candidate;
      }
    }
  }

  return null;
}

function findXamppInstall() {
  if (process.platform !== "win32") {
    return null;
  }

  const directCandidates = [
    process.env.XAMPP_HOME,
    process.env.XAMPP_ROOT,
    "C:\\xampp",
    "D:\\xampp",
    "E:\\xampp",
    path.join(process.env.ProgramFiles || "C:\\Program Files", "xampp"),
    path.join(
      process.env["ProgramFiles(x86)"] || "C:\\Program Files (x86)",
      "xampp",
    ),
    path.join(process.env.LOCALAPPDATA || "", "xampp"),
  ].filter(Boolean);

  const driveCandidates = [];
  for (const root of getWindowsDriveRoots()) {
    driveCandidates.push(path.join(root, "xampp"));

    try {
      for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
        if (entry.isDirectory() && /xampp/i.test(entry.name)) {
          driveCandidates.push(path.join(root, entry.name));
        }
      }
    } catch {
      // Some drive roots are not readable without elevation.
    }
  }

  for (const candidate of existingDirectories([
    ...directCandidates,
    ...driveCandidates,
  ])) {
    const controlPanel = path.join(candidate, "xampp-control.exe");
    const htdocs = path.join(candidate, "htdocs");
    const php = path.join(candidate, "php", "php.exe");

    if (
      fs.existsSync(controlPanel) ||
      fs.existsSync(htdocs) ||
      fs.existsSync(php)
    ) {
      return {
        root: candidate,
        htdocs: fs.existsSync(htdocs) ? htdocs : null,
        php: fs.existsSync(php) ? php : null,
        controlPanel: fs.existsSync(controlPanel) ? controlPanel : null,
      };
    }
  }

  const controlPanelOnPath = findExecutableOnPath("xampp-control");

  if (controlPanelOnPath) {
    const root = path.dirname(controlPanelOnPath);
    return {
      root,
      htdocs: fs.existsSync(path.join(root, "htdocs"))
        ? path.join(root, "htdocs")
        : null,
      php: fs.existsSync(path.join(root, "php", "php.exe"))
        ? path.join(root, "php", "php.exe")
        : null,
      controlPanel: controlPanelOnPath,
    };
  }

  return null;
}

function isInsideDir(child, parent) {
  if (!child || !parent) return false;

  const relative = path.relative(path.resolve(parent), path.resolve(child));
  return (
    Boolean(
      relative && !relative.startsWith("..") && !path.isAbsolute(relative),
    ) || relative === ""
  );
}

function hasPhpCli() {
  const result = spawnSync("php", ["-v"], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
    shell: false,
  });

  return !result.error && result.status === 0;
}

async function runPhpProject(projectDir) {
  copyEnvExample(projectDir);
  const runtime = await withSpinner("Checking PHP runtime", () =>
    Promise.resolve({
      xampp: findXamppInstall(),
      php: hasPhpCli(),
    }),
  );

  if (runtime.xampp?.htdocs && isInsideDir(projectDir, runtime.xampp.htdocs)) {
    const relativeUrl = path
      .relative(runtime.xampp.htdocs, projectDir)
      .split(path.sep)
      .map(encodeURIComponent)
      .join("/");
    const url = `http://localhost/${relativeUrl}`;
    const server = createExternalServer({
      kind: "xampp",
      label: "XAMPP Apache",
      url,
      cwd: projectDir,
      commandText: "xampp apache",
      checkStatus: () => canConnectWithRetry(80, 3, 250),
    });

    console.log(`\n  ${A}${c.bold}${ICON.work} PHP project link${c.reset}`);
    console.log(`  ${A}${ICON.arrow}${c.reset} ${url}`);
    console.log(
      `  ${DIM}XAMPP found at ${runtime.xampp.root}. Start Apache if it is not already running.${c.reset}\n`,
    );
    await printServerStatus([server]);
    return;
  }

  const phpCommand = runtime.xampp?.php || "php";

  if (!runtime.php && !runtime.xampp?.php) {
    printError(
      "PHP not found",
      "Install PHP or XAMPP, then run scafkit run php again.",
    );
    return;
  }

  if (!fs.existsSync(path.join(projectDir, "public"))) {
    printError("PHP public folder not found", path.join(projectDir, "public"));
    return;
  }

  const server = startManagedServer({
    kind: "php",
    label: "PHP server",
    url: "http://localhost:8000",
    cwd: projectDir,
    command: phpCommand,
    args: ["-S", "localhost:8000", "-t", "public"],
    commandText: "php -S localhost:8000 -t public",
    checkStatus: () => canConnectWithRetry(8000),
  });

  console.log(`\n  ${A}${c.bold}${ICON.work} PHP server${c.reset}`);
  console.log(`  ${A}${ICON.arrow}${c.reset} ${server.url}`);
  if (runtime.xampp && !isInsideDir(projectDir, runtime.xampp.htdocs)) {
    console.log(
      `  ${DIM}XAMPP was found at ${runtime.xampp.root}, but this project is not inside htdocs, so Scafkit started PHP's local server instead.${c.reset}`,
    );
  }
  await printServerStatus([server]);
}

async function handleRun(args) {
  const target = (args[0] || "").toLowerCase();

  if (target === "status") {
    await handleStatus();
    return;
  }

  if (target === "stop") {
    handleStop(args.slice(1));
    return;
  }

  if (target === "php") {
    await runPhpProject(process.cwd());
    return;
  }

  if (target === "pern") {
    const projectDirs = findPernProjectDirs(process.cwd());

    if (!projectDirs) {
      printError(
        "PERN project not found",
        "Run this inside a PERN root, client folder, or server folder.",
      );
      return;
    }

    const clientResult = await ensureNpmDependencies(projectDirs.clientDir);
    const serverResult = await ensureNpmDependencies(projectDirs.serverDir);

    if (!clientResult.ok || !serverResult.ok) {
      printError(
        "Dependency install failed",
        clientResult.ok ? serverResult.message : clientResult.message,
      );
      return;
    }

    const clientRunner = getNpmRunCommand("dev");
    const serverRunner = getNpmRunCommand("dev");
    const client = startManagedServer({
      kind: "pern-client",
      label: "PERN client",
      url: "http://localhost:5173",
      cwd: projectDirs.clientDir,
      command: clientRunner.command,
      args: clientRunner.args,
      commandText: "npm run dev",
      checkStatus: () => canConnectWithRetry(5173),
    });
    const server = startManagedServer({
      kind: "pern-server",
      label: "PERN API",
      url: "http://localhost:4000/api/health",
      cwd: projectDirs.serverDir,
      command: serverRunner.command,
      args: serverRunner.args,
      commandText: "npm run dev",
      checkStatus: () => canConnectWithRetry(4000),
    });

    console.log(`\n  ${A}${c.bold}${ICON.work} PERN servers${c.reset}`);
    console.log(`  ${A}${ICON.arrow}${c.reset} Front end  ${client.url}`);
    console.log(`  ${A}${ICON.arrow}${c.reset} Back end   ${server.url}`);
    await sleep(1000);
    await printServerStatus([client, server]);
    return;
  }

  if (target && target !== "react") {
    printError(
      "Unknown run target",
      "Use: run php, run react, run pern, run status, or run stop all.",
    );
    return;
  }

  const projectDir = findRunnableProjectDir(process.cwd());

  if (!projectDir) {
    printError(
      "No runnable project found",
      "Run this inside a React project or use run pern inside a PERN root.",
    );
    return;
  }

  await runPackageProject(projectDir);
}

function resolveBackendFile(fileArg) {
  if (!fileArg) return null;

  const target = path.resolve(process.cwd(), fileArg);
  return fs.existsSync(target) && fs.statSync(target).isFile() ? target : null;
}

async function runBackendFile(filePath) {
  const projectDir =
    findNearestPackageDir(path.dirname(filePath)) || path.dirname(filePath);
  const extension = path.extname(filePath).toLowerCase();

  await ensureNpmDependencies(projectDir);

  if (extension === ".ts") {
    await installDevPackages(projectDir, ["tsx", "nodemon"]);
    console.log(
      `\n  ${A}${c.bold}${ICON.work} Opening Express server${c.reset}`,
    );
    console.log(`  ${A}${ICON.arrow}${c.reset} http://localhost:4000\n`);
    await npmCommand(
      [
        "exec",
        "nodemon",
        "--watch",
        "src",
        "--ext",
        "ts",
        "--exec",
        `tsx ${path.relative(projectDir, filePath)}`,
      ],
      projectDir,
    );
    return;
  }

  if (extension === ".js" || extension === ".mjs") {
    await installDevPackages(projectDir, ["nodemon"]);
    console.log(
      `\n  ${A}${c.bold}${ICON.work} Opening Express server${c.reset}`,
    );
    console.log(`  ${A}${ICON.arrow}${c.reset} http://localhost:4000\n`);
    await npmCommand(
      ["exec", "nodemon", path.relative(projectDir, filePath)],
      projectDir,
    );
    return;
  }

  printError("Unsupported file", "Use a .js, .mjs, or .ts server entry file.");
}

const commandHandlers = Object.freeze({
  help: (args) => help(args[0]),
  "--help": () => help(),
  "-h": () => help(),
  "?": (args) => help(args[0]),
  version: () => printVersion(),
  "--version": () => printVersion(),
  "-v": () => printVersion(),
  list: () => printTemplateList(),
  "--list": () => printTemplateList(),
  templates: () => printTemplateList(),
  create: handleCreate,
  new: handleCreate,
  clear: () => {
    console.clear();
    banner();
  },
  cls: () => {
    console.clear();
    banner();
  },
  pwd: () => console.log(`  ${A}${ICON.arrow}${c.reset} ${process.cwd()}`),
  cd: handleCd,
  chdir: handleCd,
  run: handleRun,
  inspect: handleInspect,
  doctor: handleDoctor,
  status: handleStatus,
  stop: handleStop,
  update: handleUpdate,
  "make:controller": handleMakeController,
  "craft:controller": handleMakeController,
  "make:route": handleMakeRoute,
  "craft:route": handleMakeRoute,
  exit: (args, rl) => {
    console.log(`\n  ${DIM}Session closed. Goodbye.${c.reset}\n`);
    if (rl) {
      rl.close();
    }
  },
  quit: (args, rl) => {
    console.log(`\n  ${DIM}Session closed. Goodbye.${c.reset}\n`);
    if (rl) {
      rl.close();
    }
  },
  pern: handlePern,
  react: handleReact,
  php: handlePhp,
});

async function handleCommand(line, rl) {
  const tokens = tokenize(line.trim());
  if (tokens[0] && tokens[0].toLowerCase() === "scafkit") {
    tokens.shift();
  }

  const command = tokens[0];
  if (!command) return;

  const handler = commandHandlers[command.toLowerCase()];
  if (!handler) {
    const backendFile = resolveBackendFile(command);

    if (backendFile) {
      await runBackendFile(backendFile);
      return;
    }

    console.log(
      `\n  ${A3}${c.bold}${ICON.warn} Unknown command:${c.reset} ${c.white}${command}${c.reset}`,
    );
    console.log(
      `  ${DIM}Type ${c.reset}${A}help${c.reset}${DIM} to view available commands.${c.reset}\n`,
    );
    return;
  }

  await handler(tokens.slice(1), rl);
}

async function startCli() {
  enableUtf8Console();
  process.once("SIGINT", () => {
    stopAllManagedServers();
    process.exit(0);
  });
  const argv = process.argv.slice(2);

  if (argv.length > 0) {
    await handleCommand(
      argv.map((arg) => (/\s/.test(arg) ? `"${arg}"` : arg)).join(" "),
      null,
    );
    return;
  }

  banner();

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt:
      `  ${c.fg(239)}┌─${c.reset} ${A}${c.bold}scafkit${c.reset}\n` +
      `  ${c.fg(239)}└${ICON.arrow}${c.reset} `,
  });

  rl.prompt();

  rl.on("line", async (line) => {
    await handleCommand(line, rl);
    if (!rl.closed) rl.prompt();
  });

  rl.on("close", () => process.exit(0));
}

void startCli();
