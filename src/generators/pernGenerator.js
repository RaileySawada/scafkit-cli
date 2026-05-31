const path = require('path');
const {
  ensureDirectory,
  writeTextFile,
  createTracker,
  sanitizePackageName
} = require('../utils/fileSystem');

const versions = Object.freeze({
  react: '^19.2.6',
  reactDom: '^19.2.6',
  lucideReact: '^1.16.0',
  vite: '^8.0.14',
  typescript: '^6.0.3',
  viteReact: '^6.0.2',
  express: '^5.2.1',
  cors: '^2.8.6',
  dotenv: '^17.4.2',
  pg: '^8.21.0',
  mysql2: '^3.22.3',
  sqlite3: '^6.0.1',
  tedious: '^19.2.1',
  mariadb: '^3.5.2',
  sequelizeCore: '^7.0.0-alpha.48',
  sequelizePostgres: '^7.0.0-alpha.48',
  sequelizeMysql: '^7.0.0-alpha.48',
  sequelizeSqlite: '^7.0.0-alpha.48',
  sequelizeMariadb: '^7.0.0-alpha.48',
  sequelizeMssql: '^7.0.0-alpha.48',
  tsx: '^4.22.3',
  nodemon: '^3.1.11',
  tailwind: '^4.3.0',
  tailwindVite: '^4.3.0'
});

const sequelizeDialects = Object.freeze({
  pg: {
    label: 'Sequelize + PostgreSQL',
    envUrl: 'postgres://postgres:postgres@localhost:5432/scafkit_pern',
    dialectPackage: '@sequelize/postgres',
    dialectVersion: versions.sequelizePostgres,
    driverPackage: 'pg',
    driverVersion: versions.pg,
    dialectImport: 'PostgresDialect'
  },
  mysql: {
    label: 'Sequelize + MySQL',
    envUrl: 'mysql://root:password@localhost:3306/scafkit_pern',
    dialectPackage: '@sequelize/mysql',
    dialectVersion: versions.sequelizeMysql,
    driverPackage: 'mysql2',
    driverVersion: versions.mysql2,
    dialectImport: 'MySqlDialect'
  },
  sqlite: {
    label: 'Sequelize + SQLite',
    envUrl: './database/scafkit.sqlite',
    dialectPackage: '@sequelize/sqlite3',
    dialectVersion: versions.sequelizeSqlite,
    driverPackage: 'sqlite3',
    driverVersion: versions.sqlite3,
    dialectImport: 'SqliteDialect'
  },
  mariadb: {
    label: 'Sequelize + MariaDB',
    envUrl: 'mariadb://root:password@localhost:3306/scafkit_pern',
    dialectPackage: '@sequelize/mariadb',
    dialectVersion: versions.sequelizeMariadb,
    driverPackage: 'mariadb',
    driverVersion: versions.mariadb,
    dialectImport: 'MariaDbDialect'
  },
  mssql: {
    label: 'Sequelize + Microsoft SQL Server',
    envUrl: 'mssql://sa:password@localhost:1433/scafkit_pern',
    dialectPackage: '@sequelize/mssql',
    dialectVersion: versions.sequelizeMssql,
    driverPackage: 'tedious',
    driverVersion: versions.tedious,
    dialectImport: 'MsSqlDialect'
  }
});

function createClientPackageJson(packageName, tailwind, language = 'typescript') {
  const isTypeScript = language !== 'javascript';
  const devDependencies = {
    '@vitejs/plugin-react': versions.viteReact,
    vite: versions.vite
  };

  if (isTypeScript) {
    devDependencies['@types/react'] = '^19.2.15';
    devDependencies['@types/react-dom'] = '^19.2.3';
    devDependencies.typescript = versions.typescript;
  }

  if (tailwind) {
    devDependencies.tailwindcss = versions.tailwind;
    devDependencies['@tailwindcss/vite'] = versions.tailwindVite;
  }

  return `${JSON.stringify({
    name: `${packageName}-client`,
    version: '1.0.0',
    private: true,
    type: 'module',
    scripts: {
      dev: 'vite',
      build: isTypeScript ? 'tsc -b && vite build' : 'vite build',
      preview: 'vite preview'
    },
    dependencies: {
      react: versions.react,
      'react-dom': versions.reactDom,
      'lucide-react': versions.lucideReact
    },
    devDependencies
  }, null, 2)}\n`;
}

function createServerPackageJson(packageName, sequelizeDialect, language = 'typescript') {
  const isTypeScript = language !== 'javascript';
  const scripts = {
    dev: isTypeScript ? 'nodemon --watch src --ext ts --exec tsx src/index.ts' : 'nodemon src/index.js',
    build: isTypeScript ? 'tsc' : 'node --check src/index.js',
    start: isTypeScript ? 'node dist/index.js' : 'node src/index.js'
  };
  const dependencies = {
    cors: versions.cors,
    dotenv: versions.dotenv,
    express: versions.express
  };
  const devDependencies = {
    nodemon: versions.nodemon
  };

  if (isTypeScript) {
    devDependencies['@types/cors'] = '^2.8.19';
    devDependencies['@types/express'] = '^5.0.6';
    devDependencies['@types/node'] = '^25.9.1';
    devDependencies.tsx = versions.tsx;
    devDependencies.typescript = versions.typescript;
  }

  if (sequelizeDialect) {
    const dialect = sequelizeDialects[sequelizeDialect];
    dependencies['@sequelize/core'] = versions.sequelizeCore;
    dependencies[dialect.dialectPackage] = dialect.dialectVersion;
    dependencies[dialect.driverPackage] = dialect.driverVersion;
  } else {
    dependencies.pg = versions.pg;
    if (isTypeScript) {
      devDependencies['@types/pg'] = '^8.20.0';
    }
    scripts['db:schema'] = 'psql "$DATABASE_URL" -f database/schema.sql';
    scripts['db:seed'] = 'psql "$DATABASE_URL" -f database/seed.sql';
  }

  return `${JSON.stringify({
    name: `${packageName}-server`,
    version: '1.0.0',
    private: true,
    type: 'module',
    scripts,
    dependencies,
    devDependencies
  }, null, 2)}\n`;
}

function createClientApp(tailwind) {
  const shellClass = tailwind ? 'app-shell min-h-screen bg-[#101114] text-slate-50' : 'app-shell';
  const panelClass = tailwind ? 'mx-auto grid min-h-screen w-[min(1180px,calc(100vw-2rem))] content-center gap-4 py-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]' : 'app-grid';
  const heroClass = tailwind ? 'rounded-lg border border-slate-200/15 bg-[#181a20]/95 p-6 shadow-2xl shadow-black/25 sm:p-10' : 'hero-panel';
  const asideClass = tailwind ? 'rounded-lg border border-slate-200/15 bg-[#1f232b]/90 p-6 shadow-2xl shadow-black/20' : 'side-panel';
  const buttonClass = tailwind ? 'inline-flex items-center justify-center gap-2 rounded-lg bg-teal-300 px-4 py-3 font-black text-slate-950 transition hover:bg-amber-200' : 'primary-button';
  const preClass = tailwind ? 'mt-5 min-h-36 overflow-auto rounded-lg border border-slate-200/15 bg-[#111318]/90 p-4 text-sm text-teal-100' : 'response-box';
  const kickerClass = tailwind ? 'mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-slate-200/15 bg-teal-300/10 px-3 py-1 text-xs font-black uppercase text-amber-200' : 'eyebrow';
  const statGridClass = tailwind ? 'mt-6 grid gap-3 sm:grid-cols-3' : 'stat-grid';
  const statClass = tailwind ? 'rounded-lg border border-cyan-300/20 bg-slate-950/60 p-3 text-sm text-slate-300' : 'stat-card';
  const featureGridClass = tailwind ? 'mt-4 grid gap-3 sm:grid-cols-3' : 'feature-grid';
  const featureClass = tailwind ? 'rounded-lg border border-cyan-300/20 bg-slate-950/55 p-4' : 'feature-card';

  return String.raw`import { useEffect, useState } from 'react';
import { Braces, Database, RefreshCcw, Server, ShieldCheck } from 'lucide-react';
import { getHealthStatus } from '../lib/services/healthService';
import type { HealthStatus } from '../lib/types/api';
import '../styles.css';

export default function App() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function refreshHealth() {
    try {
      setError(null);
      setHealth(await getHealthStatus());
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to reach the API.');
    }
  }

  useEffect(() => {
    void refreshHealth();
  }, []);

  return (
    <main className="${shellClass}">
      <div className="${panelClass}">
        <section className="${heroClass}">
          <div className="${kickerClass}">
            <Server size={18} />
            Scafkit PERN Platform
          </div>
          <h1>A full-stack operations surface with health checks built in.</h1>
          <p>
            React client, Express API, database scripts, routes, services, and deployment notes land in clear ownership zones with a practical dashboard up front.
          </p>
          <div className="${statGridClass}">
            <span className="${statClass}"><strong>React</strong> client</span>
            <span className="${statClass}"><strong>Express</strong> API</span>
            <span className="${statClass}"><strong>Postgres</strong> ready</span>
          </div>
          <button className="${buttonClass}" onClick={refreshHealth}>
            <RefreshCcw size={18} />
            Check API
          </button>
          <pre className="${preClass}">{error ? error : JSON.stringify(health, null, 2)}</pre>
        </section>
        <aside className="${asideClass}">
          <Database size={28} />
          <h2>Production-shaped by default</h2>
          <p>
            Server config, routes, services, models, database scripts, Docker files, and deployment notes are grouped where teams expect them.
          </p>
          <div className="${featureGridClass}">
            <article className="${featureClass}"><Braces size={20} /><strong>API</strong><span>/api/health</span></article>
            <article className="${featureClass}"><ShieldCheck size={20} /><strong>Ops</strong><span>docker notes</span></article>
            <article className="${featureClass}"><Server size={20} /><strong>Scafkit</strong><span>clear layers</span></article>
          </div>
        </aside>
      </div>
    </main>
  );
}
`;
}

function createClientAppJsx(tailwind) {
  return createClientApp(tailwind)
    .replace("import type { HealthStatus } from '../lib/types/api';\n", '')
    .replace('useState<HealthStatus | null>(null)', 'useState(null)')
    .replace('useState<string | null>(null)', 'useState(null)');
}

function createClientStyles(tailwind) {
  if (tailwind) {
    return String.raw`@import "tailwindcss";

@layer base {
  :root {
    font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  }

  body {
    margin: 0;
    min-width: 320px;
    background: #101114;
  }

  h1 {
    margin: 0;
    max-width: 48rem;
    font-size: clamp(2.15rem, 6vw, 4.9rem);
    font-weight: 900;
    line-height: 1;
  }

  h2 {
    margin-top: 1rem;
    font-size: 1.5rem;
    font-weight: 900;
  }

  p {
    color: #cbd5e1;
    line-height: 2;
  }
}

@layer components {
  .app-shell {
    background:
      linear-gradient(120deg, rgba(45, 212, 191, 0.16), transparent 34rem),
      linear-gradient(300deg, rgba(192, 132, 252, 0.15), transparent 30rem),
      linear-gradient(135deg, #101114 0%, #17191f 48%, #1d1a24 100%);
  }
}
`;
  }

  return String.raw`:root {
  color: #eff6ff;
  background: #101114;
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  --line: rgba(226, 232, 240, 0.16);
  --muted: #b6bfcc;
  --cyan: #2dd4bf;
  --blue: #60a5fa;
  --gold: #f5c451;
  --plum: #c084fc;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  min-width: 320px;
  min-height: 100vh;
}

button {
  font: inherit;
}

.app-shell {
  min-height: 100vh;
  background:
    linear-gradient(120deg, rgba(45, 212, 191, 0.16), transparent 34rem),
    linear-gradient(300deg, rgba(192, 132, 252, 0.15), transparent 30rem),
    linear-gradient(135deg, #101114 0%, #17191f 48%, #1d1a24 100%);
  color: #eff6ff;
}

.app-grid {
  width: min(1180px, calc(100vw - 2rem));
  min-height: 100vh;
  margin: 0 auto;
  padding: 2rem 0;
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(320px, 0.8fr);
  gap: 1rem;
  align-content: center;
}

.hero-panel,
.side-panel {
  border: 1px solid var(--line);
  border-radius: 8px;
  background: rgba(12, 28, 48, 0.9);
  box-shadow: 0 24px 90px rgba(0, 0, 0, 0.34);
}

.hero-panel {
  padding: clamp(1.5rem, 5vw, 4rem);
}

.side-panel {
  padding: 2rem;
}

.eyebrow,
.primary-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.eyebrow {
  margin-bottom: 1rem;
  width: fit-content;
  border: 1px solid var(--line);
  border-radius: 999px;
  padding: 0.35rem 0.7rem;
  background: rgba(34, 211, 238, 0.1);
  color: var(--gold);
  font-weight: 900;
  text-transform: uppercase;
  font-size: 0.78rem;
}

h1 {
  margin: 0;
  max-width: 760px;
  font-size: clamp(2.25rem, 5vw, 4.5rem);
  line-height: 1;
}

h2 {
  margin: 1rem 0 0.5rem;
}

p {
  color: var(--muted);
  line-height: 1.75;
}

.stat-grid,
.feature-grid {
  display: grid;
  gap: 0.75rem;
}

.stat-grid {
  grid-template-columns: repeat(3, minmax(0, 1fr));
  margin: 1.5rem 0;
}

.feature-grid {
  grid-template-columns: 1fr;
  margin-top: 1rem;
}

.stat-card,
.feature-card {
  border: 1px solid var(--line);
  border-radius: 8px;
  background: rgba(7, 17, 31, 0.68);
  padding: 0.85rem;
  color: var(--muted);
}

.stat-card strong,
.feature-card strong {
  display: block;
  color: #eff6ff;
}

.feature-card {
  display: grid;
  gap: 0.4rem;
}

.primary-button {
  border: 0;
  border-radius: 8px;
  padding: 0.85rem 1rem;
  background: linear-gradient(135deg, var(--cyan), var(--blue));
  color: #06111f;
  font-weight: 900;
  cursor: pointer;
}

.response-box {
  width: 100%;
  min-height: 144px;
  margin: 1.5rem 0 0;
  padding: 1rem;
  overflow: auto;
  border-radius: 8px;
  color: #cffafe;
  background: rgba(7, 17, 31, 0.82);
  border: 1px solid var(--line);
}

@media (max-width: 850px) {
  .app-grid {
    grid-template-columns: 1fr;
    padding: 2rem 0;
  }

  .stat-grid {
    grid-template-columns: 1fr;
  }
}
`;
}

function createViteConfig(tailwind) {
  if (tailwind) {
    return String.raw`import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173
  }
});
`;
  }

  return String.raw`import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173
  }
});
`;
}

function createDatabaseConfig(sequelizeDialect) {
  if (sequelizeDialect) {
    const dialect = sequelizeDialects[sequelizeDialect];

    if (sequelizeDialect === 'sqlite') {
      return String.raw`import { Sequelize } from '@sequelize/core';
import { SqliteDialect } from '@sequelize/sqlite3';
import { env } from './env.js';

export const sequelize = new Sequelize({
  dialect: SqliteDialect,
  storage: env.databaseUrl,
  logging: env.nodeEnv === 'development' ? console.log : false
});

export async function connectDatabase(): Promise<void> {
  await sequelize.authenticate();
}
`;
    }

    return `import { Sequelize } from '@sequelize/core';
import { ${dialect.dialectImport} } from '${dialect.dialectPackage}';
import { env } from './env.js';

export const sequelize = new Sequelize({
  dialect: ${dialect.dialectImport},
  url: env.databaseUrl,
  logging: env.nodeEnv === 'development' ? console.log : false
});

export async function connectDatabase(): Promise<void> {
  await sequelize.authenticate();
}
`;
  }

  return String.raw`import pg from 'pg';
import { env } from './env.js';

const { Pool } = pg;

export const pool = new Pool({
  connectionString: env.databaseUrl,
  max: 10,
  idleTimeoutMillis: 30000
});

export async function connectDatabase(): Promise<void> {
  await pool.query('SELECT 1');
}
`;
}

function createDatabaseConfigJs(sequelizeDialect) {
  return createDatabaseConfig(sequelizeDialect)
    .replace(/: Promise<void>/g, '')
    .replace(/import pg from 'pg';/, "import pg from 'pg';")
    .replace(/import \{ Sequelize \} from '@sequelize\/core';/, "import { Sequelize } from '@sequelize/core';");
}

function createUserModel(sequelizeDialect) {
  if (sequelizeDialect) {
    return String.raw`import { DataTypes, Model, type CreationOptional, type InferAttributes, type InferCreationAttributes } from '@sequelize/core';
import { sequelize } from '../config/database.js';

export class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
  declare id: CreationOptional<number>;
  declare name: string;
  declare email: string;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(120),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(160),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
  },
  {
    sequelize,
    tableName: 'users'
  }
);

export async function listUsers(): Promise<User[]> {
  return User.findAll({ order: [['id', 'ASC']] });
}
`;
  }

  return String.raw`import { pool } from '../config/database.js';

export type User = {
  id: number;
  name: string;
  email: string;
  created_at: string;
};

export async function listUsers(): Promise<User[]> {
  const result = await pool.query<User>('SELECT id, name, email, created_at FROM users ORDER BY id ASC');
  return result.rows;
}
`;
}

function createUserModelJs(sequelizeDialect) {
  if (sequelizeDialect) {
    return String.raw`import { DataTypes, Model } from '@sequelize/core';
import { sequelize } from '../config/database.js';

export class User extends Model {}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(120),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(160),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE
  },
  {
    sequelize,
    tableName: 'users'
  }
);

export async function listUsers() {
  return User.findAll({ order: [['id', 'ASC']] });
}
`;
  }

  return String.raw`import { pool } from '../config/database.js';

export async function listUsers() {
  const result = await pool.query('SELECT id, name, email, created_at FROM users ORDER BY id ASC');
  return result.rows;
}
`;
}

function addTailwindFiles(files) {
  return files;
}

function createEnvExample(sequelizeDialect) {
  const databaseUrl = sequelizeDialect
    ? sequelizeDialects[sequelizeDialect].envUrl
    : 'postgres://postgres:postgres@localhost:5432/scafkit_pern';

  return `DATABASE_URL=${databaseUrl}
PORT=4000
CLIENT_URL=http://localhost:5173
NODE_ENV=development
`;
}

function normalizeSequelizeDialect(sequelizeDialect) {
  if (!sequelizeDialect) {
    return null;
  }

  if (!sequelizeDialects[sequelizeDialect]) {
    throw new Error('Unsupported Sequelize dialect: ' + sequelizeDialect);
  }

  return sequelizeDialect;
}

function generatePernProject({ targetDir, force = false, sequelize = false, sequelizeDialect = null, tailwind = false, language = 'typescript' }) {
  if (!targetDir) {
    throw new Error('targetDir is required.');
  }

  ensureDirectory(targetDir);

  const selectedSequelizeDialect = normalizeSequelizeDialect(sequelizeDialect || (sequelize ? 'pg' : null));
  const isTypeScript = language !== 'javascript';
  const extension = isTypeScript ? 'tsx' : 'jsx';
  const scriptExtension = isTypeScript ? 'ts' : 'js';
  const packageName = sanitizePackageName(targetDir, 'scafkit-pern-app');
  const tracker = createTracker(targetDir);

  const directories = [
    'client/public',
    'client/src/app',
    'client/src/components',
    'client/src/features/health',
    'client/src/lib/api',
    'client/src/lib/config',
    'client/src/lib/services',
    'client/src/lib/types',
    'server/database',
    'server/ops/docker',
    'server/ops/deploy',
    'server/src/config',
    'server/src/controllers',
    'server/src/middleware',
    'server/src/models',
    'server/src/routes',
    'server/src/services',
    'server/src/types'
  ];

  for (const directory of directories) {
    ensureDirectory(path.join(targetDir, directory));
  }

  const files = {
    'client/package.json': createClientPackageJson(packageName, tailwind, language),
    'client/index.html': String.raw`<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Scafkit PERN Client</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.${extension}"></script>
  </body>
</html>
`,
    [`client/vite.config.${scriptExtension}`]: createViteConfig(tailwind),
    ...(isTypeScript ? { 'client/tsconfig.json': String.raw`{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["DOM", "DOM.Iterable", "ES2020"],
    "allowJs": false,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx"
  },
  "include": ["src"]
}
` } : {}),
    'client/.env.example': String.raw`VITE_API_URL=http://localhost:4000
`,
    'client/.gitignore': String.raw`node_modules
dist
.env
`,
    'client/README.md': String.raw`# Client

React ${isTypeScript ? 'TypeScript' : 'JavaScript'} client generated by Scafkit.

## Commands

    npm install
    npm run dev
    npm run build
`,
    [`client/src/main.${extension}`]: isTypeScript ? String.raw`import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app/App';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
` : String.raw`import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app/App';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
`,
    [`client/src/app/App.${extension}`]: isTypeScript ? createClientApp(tailwind) : createClientAppJsx(tailwind),
    'client/src/styles.css': createClientStyles(tailwind),
    ...(isTypeScript ? { 'client/src/lib/types/api.ts': String.raw`export type HealthStatus = {
  status: string;
  service: string;
  timestamp: string;
  database: string;
};

export type User = {
  id: number;
  name: string;
  email: string;
  created_at?: string;
  createdAt?: string;
};
` } : {}),
    [`client/src/lib/config/env.${scriptExtension}`]: isTypeScript ? String.raw`export function getApiBaseUrl(): string {
  return import.meta.env.VITE_API_URL || 'http://localhost:4000';
}
` : String.raw`export function getApiBaseUrl() {
  return import.meta.env.VITE_API_URL || 'http://localhost:4000';
}
`,
    [`client/src/lib/api/httpClient.${scriptExtension}`]: isTypeScript ? String.raw`type HttpClientConfig = {
  baseUrl: string;
};

export function createHttpClient(config: HttpClientConfig) {
  return {
    async get<TResponse>(path: string): Promise<TResponse> {
      const base = config.baseUrl.replace(/\/$/, '');
      const normalizedPath = path.startsWith('/') ? path : '/' + path;
      const response = await fetch(base + normalizedPath);

      if (!response.ok) {
        throw new Error('Request failed with status ' + response.status);
      }

      return response.json() as Promise<TResponse>;
    }
  };
}
` : String.raw`export function createHttpClient(config) {
  return {
    async get(path) {
      const base = config.baseUrl.replace(/\/$/, '');
      const normalizedPath = path.startsWith('/') ? path : '/' + path;
      const response = await fetch(base + normalizedPath);

      if (!response.ok) {
        throw new Error('Request failed with status ' + response.status);
      }

      return response.json();
    }
  };
}
`,
    [`client/src/lib/api/apiClient.${scriptExtension}`]: String.raw`import { createHttpClient } from './httpClient';
import { getApiBaseUrl } from '../config/env';

export const apiClient = createHttpClient({
  baseUrl: getApiBaseUrl()
});
`,
    [`client/src/lib/services/healthService.${scriptExtension}`]: isTypeScript ? String.raw`import { apiClient } from '../api/apiClient';
import type { HealthStatus } from '../types/api';

export function getHealthStatus(): Promise<HealthStatus> {
  return apiClient.get<HealthStatus>('/api/health');
}
` : String.raw`import { apiClient } from '../api/apiClient';

export function getHealthStatus() {
  return apiClient.get('/api/health');
}
`,
    [`client/src/lib/services/userService.${scriptExtension}`]: isTypeScript ? String.raw`import { apiClient } from '../api/apiClient';
import type { User } from '../types/api';

export function getUsers(): Promise<User[]> {
  return apiClient.get<User[]>('/api/users');
}
` : String.raw`import { apiClient } from '../api/apiClient';

export function getUsers() {
  return apiClient.get('/api/users');
}
`,
    'server/package.json': createServerPackageJson(packageName, selectedSequelizeDialect, language),
    ...(isTypeScript ? { 'server/tsconfig.json': String.raw`{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true,
    "skipLibCheck": true,
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src"]
}
` } : {}),
    'server/.env.example': createEnvExample(selectedSequelizeDialect),
    'server/.gitignore': String.raw`node_modules
dist
.env
coverage
`,
    'server/README.md': String.raw`# Server

Express ${isTypeScript ? 'TypeScript' : 'JavaScript'} API generated by Scafkit.

## Commands

    npm install
    cp .env.example .env
    npm run dev
    npm run db:schema
    npm run db:seed
`,
    'server/database/schema.sql': String.raw`CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(160) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`,
    'server/database/seed.sql': String.raw`INSERT INTO users (name, email)
VALUES ('Demo User', 'demo@example.com')
ON CONFLICT (email) DO NOTHING;
`,
    'server/ops/docker/Dockerfile': String.raw`FROM node:22-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
CMD ["npm", "start"]
`,
    'server/ops/docker/docker-compose.yml': String.raw`services:
  api:
    build:
      context: ../..
      dockerfile: ops/docker/Dockerfile
    env_file:
      - ../../.env
    ports:
      - "4000:4000"
    depends_on:
      - postgres

  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: scafkit_pern
    ports:
      - "5432:5432"
    volumes:
      - postgres-data:/var/lib/postgresql/data

volumes:
  postgres-data:
`,
    'server/ops/deploy/render.yaml': String.raw`services:
  - type: web
    name: scafkit-pern-api
    env: node
    buildCommand: npm install && npm run build
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
`,
    [`server/src/index.${scriptExtension}`]: String.raw`import app from './app.js';
import { env } from './config/env.js';
import { connectDatabase } from './config/database.js';

async function bootstrap() {
  app.listen(env.port, () => {
    console.log('Scafkit server running on http://localhost:' + env.port);
  });

  try {
    await connectDatabase();
    console.log('Database connection ready.');
  } catch (error) {
    console.warn('Database connection skipped:', error instanceof Error ? error.message : error);
  }
}

void bootstrap();
`,
    [`server/src/app.${scriptExtension}`]: String.raw`import cors from 'cors';
import express from 'express';
import { apiRoutes } from './routes/index.js';
import { errorMiddleware } from './middleware/error.middleware.js';
import { env } from './config/env.js';

const app = express();

app.use(cors({ origin: env.clientUrl }));
app.use(express.json());
app.use('/api', apiRoutes);
app.use(errorMiddleware);

export default app;
`,
    [`server/src/config/env.${scriptExtension}`]: String.raw`import dotenv from 'dotenv';

dotenv.config();

export const env = {
  databaseUrl: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/scafkit_pern',
  port: Number(process.env.PORT || 4000),
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  nodeEnv: process.env.NODE_ENV || 'development'
};
`,
    [`server/src/config/database.${scriptExtension}`]: isTypeScript ? createDatabaseConfig(selectedSequelizeDialect) : createDatabaseConfigJs(selectedSequelizeDialect),
    [`server/src/controllers/health.controller.${scriptExtension}`]: isTypeScript ? String.raw`import type { Request, Response } from 'express';

export function getHealth(_request: Request, response: Response) {
  response.json({
    status: 'ok',
    service: 'scafkit-pern-api',
    timestamp: new Date().toISOString(),
    database: 'postgresql'
  });
}
` : String.raw`export function getHealth(_request, response) {
  response.json({
    status: 'ok',
    service: 'scafkit-pern-api',
    timestamp: new Date().toISOString(),
    database: 'postgresql'
  });
}
`,
    [`server/src/controllers/user.controller.${scriptExtension}`]: isTypeScript ? String.raw`import type { NextFunction, Request, Response } from 'express';
import { listUsers } from '../models/User.js';

export async function getUsers(_request: Request, response: Response, next: NextFunction) {
  try {
    response.json(await listUsers());
  } catch (error) {
    next(error);
  }
}
` : String.raw`import { listUsers } from '../models/User.js';

export async function getUsers(_request, response, next) {
  try {
    response.json(await listUsers());
  } catch (error) {
    next(error);
  }
}
`,
    [`server/src/routes/index.${scriptExtension}`]: String.raw`import { Router } from 'express';
import { getHealth } from '../controllers/health.controller.js';
import { getUsers } from '../controllers/user.controller.js';

export const apiRoutes = Router();

apiRoutes.get('/health', getHealth);
apiRoutes.get('/users', getUsers);
`,
    [`server/src/middleware/error.middleware.${scriptExtension}`]: isTypeScript ? String.raw`import type { ErrorRequestHandler } from 'express';

export const errorMiddleware: ErrorRequestHandler = (error, _request, response, _next) => {
  console.error(error);

  response.status(500).json({
    message: 'Internal server error.'
  });
};
` : String.raw`export function errorMiddleware(error, _request, response, _next) {
  console.error(error);

  response.status(500).json({
    message: 'Internal server error.'
  });
}
`,
    [`server/src/models/User.${scriptExtension}`]: isTypeScript ? createUserModel(selectedSequelizeDialect) : createUserModelJs(selectedSequelizeDialect),
    ...(isTypeScript ? { 'server/src/types/api.ts': String.raw`export type ApiMessage = {
  message: string;
};
` } : {})
  };

  if (tailwind) {
    addTailwindFiles(files);
  }

  for (const [relativePath, content] of Object.entries(files)) {
    writeTextFile(path.join(targetDir, relativePath), content, force, tracker);
  }

  return tracker;
}

module.exports = {
  generatePernProject
};
