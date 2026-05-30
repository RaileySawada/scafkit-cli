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
  viteReact: '^6.0.2',
  typescript: '^6.0.3',
  netlify: '^17.37.0',
  netlifyFunctions: '^2.8.2',
  tailwind: '^4.3.0',
  tailwindVite: '^4.3.0'
});

function createReactPackageJson(packageName, serverless, tailwind, language = 'typescript') {
  const isTypeScript = language !== 'javascript';
  const packageJson = {
    name: packageName,
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
    devDependencies: {
      '@vitejs/plugin-react': versions.viteReact,
      vite: versions.vite
    }
  };

  if (isTypeScript) {
    packageJson.devDependencies['@types/react'] = '^19.2.15';
    packageJson.devDependencies['@types/react-dom'] = '^19.2.3';
    packageJson.devDependencies.typescript = versions.typescript;
  }

  if (serverless) {
    packageJson.scripts['netlify:dev'] = 'netlify dev';
    packageJson.devDependencies.netlify = versions.netlify;
    packageJson.devDependencies['@netlify/functions'] = versions.netlifyFunctions;
  }

  if (tailwind) {
    packageJson.devDependencies.tailwindcss = versions.tailwind;
    packageJson.devDependencies['@tailwindcss/vite'] = versions.tailwindVite;
  }

  return `${JSON.stringify(packageJson, null, 2)}\n`;
}

function createAppTsx(serverless, tailwind) {
  const shellClass = tailwind ? 'app-shell min-h-screen bg-[#07111f] text-slate-50' : 'app-shell';
  const layoutClass = tailwind ? 'mx-auto grid min-h-screen w-[min(1180px,calc(100vw-2rem))] content-center gap-4 py-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]' : 'app-grid';
  const heroClass = tailwind ? 'rounded-lg border border-cyan-300/20 bg-slate-900/90 p-6 shadow-2xl shadow-black/30 sm:p-10' : 'hero-panel';
  const asideClass = tailwind ? 'rounded-lg border border-cyan-300/20 bg-slate-900/85 p-6 shadow-2xl shadow-black/25' : 'side-panel';
  const buttonClass = tailwind ? 'inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-300 px-4 py-3 font-black text-slate-950 transition hover:bg-sky-300 disabled:cursor-wait disabled:opacity-70' : 'primary-button';
  const preClass = tailwind ? 'mt-5 min-h-28 overflow-auto rounded-lg border border-cyan-300/20 bg-slate-950/80 p-4 text-sm text-cyan-100' : 'response-box';
  const kickerClass = tailwind ? 'mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-black uppercase text-yellow-300' : 'eyebrow';
  const statGridClass = tailwind ? 'mt-6 grid gap-3 sm:grid-cols-3' : 'stat-grid';
  const statClass = tailwind ? 'rounded-lg border border-cyan-300/20 bg-slate-950/60 p-3 text-sm text-slate-300' : 'stat-card';
  const featureGridClass = tailwind ? 'mt-4 grid gap-3 sm:grid-cols-3' : 'feature-grid';
  const featureClass = tailwind ? 'rounded-lg border border-cyan-300/20 bg-slate-950/55 p-4' : 'feature-card';

  if (serverless) {
    return String.raw`import { useEffect, useState } from 'react';
import { Rocket, Server, ShieldCheck, Sparkles, TerminalSquare } from 'lucide-react';
import { getServerlessMessage } from '../lib/services/serverlessService';
import '../styles.css';

type ApiState = {
  message: string;
  status: 'idle' | 'loading' | 'ready' | 'error';
};

export default function App() {
  const [apiState, setApiState] = useState<ApiState>({
    message: 'Click the button to call your Netlify function.',
    status: 'idle'
  });

  async function loadServerlessMessage() {
    try {
      setApiState({ message: 'Calling serverless function...', status: 'loading' });
      const response = await getServerlessMessage();
      setApiState({ message: response.message, status: 'ready' });
    } catch (error) {
      setApiState({
        message: error instanceof Error ? error.message : 'Serverless function failed.',
        status: 'error'
      });
    }
  }

  useEffect(() => {
    document.title = 'Scafkit React Serverless Starter';
  }, []);

  return (
    <main className="${shellClass}">
      <div className="${layoutClass}">
        <section className="${heroClass}">
          <div className="${kickerClass}">
            <Sparkles size={18} />
            Scafkit React Serverless
          </div>
          <h1>Launch a polished React app with serverless endpoints already wired.</h1>
          <p>
            Scafkit gives the starter a production-minded shape: app shell, service layer, API helpers, typed contracts, and deploy-ready functions in one responsive interface.
          </p>
          <div className="${statGridClass}">
            <span className="${statClass}"><strong>Vite</strong> fast dev loop</span>
            <span className="${statClass}"><strong>Netlify</strong> functions</span>
            <span className="${statClass}"><strong>Scafkit</strong> structure</span>
          </div>
          <button className="${buttonClass}" onClick={loadServerlessMessage} disabled={apiState.status === 'loading'}>
            <Server size={18} />
            Call function
          </button>
          <pre className="${preClass}">{apiState.message}</pre>
        </section>
        <aside className="${asideClass}">
          <Rocket size={28} />
          <h2>Project cockpit</h2>
          <p>
            Start in src/app for the shell, src/features for product behavior, and src/lib for reusable client infrastructure.
          </p>
          <div className="${featureGridClass}">
            <article className="${featureClass}"><TerminalSquare size={20} /><strong>Commands</strong><span>npm run dev</span></article>
            <article className="${featureClass}"><ShieldCheck size={20} /><strong>Patterns</strong><span>services first</span></article>
            <article className="${featureClass}"><Sparkles size={20} /><strong>Palette</strong><span>Scafkit cyan</span></article>
          </div>
        </aside>
      </div>
    </main>
  );
}
`;
  }

  return String.raw`import { useMemo, useState } from 'react';
import { Boxes, Cpu, Layers3, LibraryBig, Sparkles } from 'lucide-react';
import { createRequestClient } from '../lib/api/requestClient';
import { createStorageService } from '../lib/services/storageService';
import '../styles.css';

export default function App() {
  const requestClient = useMemo(() => createRequestClient({ baseUrl: import.meta.env.VITE_API_URL || '' }), []);
  const storageService = useMemo(() => createStorageService(), []);
  const [result, setResult] = useState('No action yet.');

  function runClientDemo() {
    storageService.set('scafkit-demo', 'Client-side service is working.');
    const saved = storageService.get('scafkit-demo');
    const endpoint = requestClient.buildUrl('/api/example');
    setResult('Saved: ' + saved + '\nEndpoint: ' + endpoint);
  }

  return (
    <main className="${shellClass}">
      <div className="${layoutClass}">
        <section className="${heroClass}">
          <div className="${kickerClass}">
            <Boxes size={18} />
            Scafkit React TypeScript
          </div>
          <h1>A modern React starter that already looks like a Scafkit product.</h1>
          <p>
            A responsive landing surface, service-ready architecture, and clear ownership zones give you a confident first screen before the real product takes over.
          </p>
          <div className="${statGridClass}">
            <span className="${statClass}"><strong>React</strong> app shell</span>
            <span className="${statClass}"><strong>Services</strong> included</span>
            <span className="${statClass}"><strong>Responsive</strong> by default</span>
          </div>
          <button className="${buttonClass}" onClick={runClientDemo}>
            <Cpu size={18} />
            Run client demo
          </button>
          <pre className="${preClass}">{result}</pre>
        </section>
        <aside className="${asideClass}">
          <LibraryBig size={28} />
          <h2>Built to stay organized</h2>
          <p>
            Put product modules in src/features and reusable infrastructure in src/lib so ownership stays obvious as the codebase grows.
          </p>
          <div className="${featureGridClass}">
            <article className="${featureClass}"><Layers3 size={20} /><strong>Layers</strong><span>app, lib, features</span></article>
            <article className="${featureClass}"><Sparkles size={20} /><strong>Brand</strong><span>Scafkit palette</span></article>
            <article className="${featureClass}"><Boxes size={20} /><strong>Starter</strong><span>ready to extend</span></article>
          </div>
        </aside>
      </div>
    </main>
  );
}
`;
}

function createAppJsx(serverless, tailwind) {
  return createAppTsx(serverless, tailwind)
    .replace("type ApiState = {\n  message: string;\n  status: 'idle' | 'loading' | 'ready' | 'error';\n};\n\n", '')
    .replace('useState<ApiState>({', 'useState({')
    .replace("useMemo(() => createRequestClient({ baseUrl: import.meta.env.VITE_API_URL || '' }), [])", "useMemo(() => createRequestClient({ baseUrl: import.meta.env.VITE_API_URL || '' }), [])");
}

function createStyles(tailwind) {
  if (tailwind) {
    return String.raw`@import "tailwindcss";

@layer base {
  :root {
    font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  }

  body {
    margin: 0;
    min-width: 320px;
    background: #07111f;
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
      radial-gradient(circle at top left, rgba(34, 211, 238, 0.22), transparent 32rem),
      radial-gradient(circle at bottom right, rgba(250, 204, 21, 0.12), transparent 28rem),
      linear-gradient(135deg, #07111f 0%, #0c1727 54%, #08111f 100%);
  }
}
`;
  }

  return String.raw`:root {
  color: #eff6ff;
  background: #07111f;
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  --line: rgba(125, 211, 252, 0.22);
  --muted: #a8bed8;
  --cyan: #22d3ee;
  --blue: #38bdf8;
  --gold: #facc15;
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
    radial-gradient(circle at top left, rgba(34, 211, 238, 0.22), transparent 32rem),
    radial-gradient(circle at bottom right, rgba(250, 204, 21, 0.12), transparent 28rem),
    linear-gradient(135deg, #07111f 0%, #0c1727 54%, #08111f 100%);
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

.primary-button:disabled {
  cursor: wait;
  opacity: 0.7;
}

.response-box {
  width: 100%;
  min-height: 112px;
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

function addTailwindFiles(files) {
  return files;
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

function generateReactProject({ targetDir, force = false, serverless = false, tailwind = false, language = 'typescript' }) {
  if (!targetDir) {
    throw new Error('targetDir is required.');
  }

  ensureDirectory(targetDir);

  const isTypeScript = language !== 'javascript';
  const extension = isTypeScript ? 'tsx' : 'jsx';
  const scriptExtension = isTypeScript ? 'ts' : 'js';
  const packageName = sanitizePackageName(targetDir, serverless ? 'scafkit-react-serverless' : 'scafkit-react-app');
  const tracker = createTracker(targetDir);

  const directories = [
    'public',
    'src/app',
    'src/components',
    'src/features',
    'src/lib/adapters',
    'src/lib/api',
    'src/lib/config',
    'src/lib/services',
    'src/lib/types',
    'src/lib/utils'
  ];

  if (serverless) {
    directories.push('netlify/functions');
  }

  for (const directory of directories) {
    ensureDirectory(path.join(targetDir, directory));
  }

  const files = {
    'package.json': createReactPackageJson(packageName, serverless, tailwind, language),
    'index.html': String.raw`<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Scafkit React Starter</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.${extension}"></script>
  </body>
</html>
`,
    [`vite.config.${scriptExtension}`]: createViteConfig(tailwind),
    ...(isTypeScript ? { 'tsconfig.json': String.raw`{
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
  "include": ["src", "netlify/functions"]
}
` } : {}),
    [`src/main.${extension}`]: isTypeScript ? String.raw`import React from 'react';
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
    [`src/app/App.${extension}`]: isTypeScript ? createAppTsx(serverless, tailwind) : createAppJsx(serverless, tailwind),
    'src/styles.css': createStyles(tailwind),
    ...(isTypeScript ? { 'src/lib/types/common.ts': String.raw`export type ApiResult<TData> = {
  data: TData;
  message: string;
};

export type Dictionary<TValue = string> = Record<string, TValue>;
` } : {}),
    [`src/lib/config/env.${scriptExtension}`]: isTypeScript ? String.raw`export function getRequiredEnv(key: string): string {
  const value = import.meta.env[key];

  if (!value) {
    throw new Error('Missing environment value: ' + key);
  }

  return value;
}
` : String.raw`export function getRequiredEnv(key) {
  const value = import.meta.env[key];

  if (!value) {
    throw new Error('Missing environment value: ' + key);
  }

  return value;
}
`,
    [`src/lib/adapters/localStorageAdapter.${scriptExtension}`]: isTypeScript ? String.raw`export function createLocalStorageAdapter(storage: Storage = window.localStorage) {
  return {
    get(key: string): string | null {
      return storage.getItem(key);
    },

    set(key: string, value: string): void {
      storage.setItem(key, value);
    },

    remove(key: string): void {
      storage.removeItem(key);
    }
  };
}
` : String.raw`export function createLocalStorageAdapter(storage = window.localStorage) {
  return {
    get(key) {
      return storage.getItem(key);
    },

    set(key, value) {
      storage.setItem(key, value);
    },

    remove(key) {
      storage.removeItem(key);
    }
  };
}
`,
    [`src/lib/services/storageService.${scriptExtension}`]: isTypeScript ? String.raw`import { createLocalStorageAdapter } from '../adapters/localStorageAdapter';

export function createStorageService() {
  const adapter = createLocalStorageAdapter();

  return {
    get(key: string): string | null {
      return adapter.get(key);
    },

    set(key: string, value: string): void {
      adapter.set(key, value);
    },

    remove(key: string): void {
      adapter.remove(key);
    }
  };
}
` : String.raw`import { createLocalStorageAdapter } from '../adapters/localStorageAdapter';

export function createStorageService() {
  const adapter = createLocalStorageAdapter();

  return {
    get(key) {
      return adapter.get(key);
    },

    set(key, value) {
      adapter.set(key, value);
    },

    remove(key) {
      adapter.remove(key);
    }
  };
}
`,
    [`src/lib/api/requestClient.${scriptExtension}`]: isTypeScript ? String.raw`type RequestClientConfig = {
  baseUrl: string;
};

export function createRequestClient(config: RequestClientConfig) {
  return {
    buildUrl(path: string): string {
      const base = config.baseUrl.replace(/\/$/, '');
      const normalizedPath = path.startsWith('/') ? path : '/' + path;
      return base + normalizedPath;
    },

    async get<TResponse>(path: string): Promise<TResponse> {
      const response = await fetch(this.buildUrl(path));

      if (!response.ok) {
        throw new Error('Request failed with status ' + response.status);
      }

      return response.json() as Promise<TResponse>;
    }
  };
}
` : String.raw`export function createRequestClient(config) {
  return {
    buildUrl(path) {
      const base = config.baseUrl.replace(/\/$/, '');
      const normalizedPath = path.startsWith('/') ? path : '/' + path;
      return base + normalizedPath;
    },

    async get(path) {
      const response = await fetch(this.buildUrl(path));

      if (!response.ok) {
        throw new Error('Request failed with status ' + response.status);
      }

      return response.json();
    }
  };
}
`,
    '.env.example': String.raw`VITE_API_URL=http://localhost:4000
`,
    '.gitignore': String.raw`node_modules
dist
.env
.netlify
`
  };

  if (serverless) {
    Object.assign(files, {
      'netlify.toml': String.raw`[build]
  command = "npm run build"
  publish = "dist"
  functions = "netlify/functions"

[dev]
  command = "npm run dev"
  targetPort = 5173
  port = 8888
`,
      [`netlify/functions/hello.${scriptExtension}`]: isTypeScript ? String.raw`import type { Handler } from '@netlify/functions';

export const handler: Handler = async () => {
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      message: 'Hello from your Scafkit Netlify serverless function.'
    })
  };
};
` : String.raw`export const handler = async () => {
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      message: 'Hello from your Scafkit Netlify serverless function.'
    })
  };
};
`,
      [`src/lib/api/serverlessClient.${scriptExtension}`]: isTypeScript ? String.raw`import type { ApiResult } from '../types/common';

export async function callServerlessFunction<TData>(functionName: string): Promise<ApiResult<TData>> {
  const response = await fetch('/.netlify/functions/' + functionName);

  if (!response.ok) {
    throw new Error('Serverless request failed with status ' + response.status);
  }

  const data = (await response.json()) as TData;

  return {
    data,
    message: 'Serverless request completed.'
  };
}
` : String.raw`export async function callServerlessFunction(functionName) {
  const response = await fetch('/.netlify/functions/' + functionName);

  if (!response.ok) {
    throw new Error('Serverless request failed with status ' + response.status);
  }

  const data = await response.json();

  return {
    data,
    message: 'Serverless request completed.'
  };
}
`,
      [`src/lib/services/serverlessService.${scriptExtension}`]: isTypeScript ? String.raw`import { callServerlessFunction } from '../api/serverlessClient';

type HelloResponse = {
  message: string;
};

export async function getServerlessMessage(): Promise<HelloResponse> {
  const result = await callServerlessFunction<HelloResponse>('hello');
  return result.data;
}
` : String.raw`import { callServerlessFunction } from '../api/serverlessClient';

export async function getServerlessMessage() {
  const result = await callServerlessFunction('hello');
  return result.data;
}
`
    });
  }

  if (tailwind) {
    addTailwindFiles(files);
  }

  for (const [relativePath, content] of Object.entries(files)) {
    writeTextFile(path.join(targetDir, relativePath), content, force, tracker);
  }

  return tracker;
}

module.exports = {
  generateReactProject
};
