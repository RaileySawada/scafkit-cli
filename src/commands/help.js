const { c, A, A2, A3, DIM, ICON, hRule } = require("../ui/theme");

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
        ["--session, -s", "Add SessionService wiring to generated controllers"],
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
        "scafkit make:controller Invoice approve reject --session",
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

  laravel: () => {
    console.log(
      `\n  ${A}${c.bold}${ICON.bolt} Laravel Production Builder${c.reset}`,
    );
    console.log(`  ${hRule(48)}\n`);
    console.log(
      `  ${A2}${c.bold}scafkit laravel:build${c.reset} ${c.white}from a Laravel project root${c.reset}\n`,
    );
    console.log(`${c.bold}  Requirements${c.reset}`);
    console.log(
      formatOptions([
        ["composer", "Must be available from the terminal"],
        ["php artisan", "The command must run from the current Laravel app"],
        ["npm", "Used when package.json is present"],
        ["mysqldump", "Used for MySQL/MariaDB SQL export"],
      ]),
    );
    console.log(`\n${c.bold}  Output${c.reset}`);
    console.log(
      `  ${DIM}Creates an <app-name>-build folder inside the Laravel project with public/, laravel-app/, root .htaccess, production .env values, and a DB_DATABASE-named SQL dump when MySQL credentials work.${c.reset}`,
    );
    console.log(`\n${c.bold}  Recommended steps${c.reset}`);
    console.log(
      formatSteps([
        "cd your-laravel-app",
        "scafkit laravel:build",
        "upload the generated folder contents to your hosting root",
        "edit laravel-app/.env APP_URL and database credentials for production",
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
        `${DIM}Try ${c.reset}${A}help pern${c.reset}${DIM}, ${c.reset}${A}help react${c.reset}${DIM}, ${c.reset}${A}help php${c.reset}${DIM}, or ${c.reset}${A}help laravel${c.reset}\n`,
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
    [
      "scafkit laravel:build",
      "composer install, npm build, artisan cache, package public/ + laravel-app/",
      "Build a Laravel app for shared-hosting style deployment",
    ],
  ];

  cmds.forEach(([cmd, flags, desc]) => {
    console.log(`  ${A}${c.bold}${cmd}${c.reset}`);
    console.log(`    ${DIM}${flags}${c.reset}`);
    console.log(`    ${c.white}${desc}${c.reset}\n`);
  });

  console.log(
    `  ${A2}${c.bold}help ${c.reset}${c.white}[php|pern|react|laravel]${c.reset}`,
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
  console.log(`  ${A}${ICON.arrow}${c.reset} scafkit laravel:build`);
  console.log(
    `  ${A}${ICON.arrow}${c.reset} scafkit make:controller Invoice approve reject`,
  );
  console.log(
    `  ${A}${ICON.arrow}${c.reset} scafkit make:route GET /invoices InvoiceController@index`,
  );
  console.log(
    `\n  ${DIM}${c.italic}Tip: run ${c.reset}${A}help pern${c.reset}${DIM}${c.italic}, ${c.reset}${A}help react${c.reset}${DIM}${c.italic}, ${c.reset}${A}help php${c.reset}${DIM}${c.italic}, or ${c.reset}${A}help laravel${c.reset}${DIM}${c.italic} for focused guidance.${c.reset}\n`,
  );
}

module.exports = { help };
