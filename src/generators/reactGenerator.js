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
  const shellClass = tailwind ? 'min-h-screen bg-zinc-950 text-zinc-100' : 'app-shell';
  const layoutClass = tailwind ? 'mx-auto grid min-h-screen w-[min(1120px,calc(100vw-2rem))] content-center gap-6 py-12 lg:grid-cols-[1.5fr_0.8fr]' : 'app-grid';
  const heroClass = tailwind ? 'rounded-lg border border-zinc-800 bg-zinc-900 p-8 shadow-2xl' : 'hero-panel';
  const asideClass = tailwind ? 'rounded-lg border border-zinc-800 bg-zinc-900 p-6' : 'side-panel';
  const buttonClass = tailwind ? 'inline-flex items-center gap-2 rounded-md bg-sky-400 px-4 py-3 font-bold text-sky-950 hover:bg-sky-300 disabled:cursor-wait disabled:opacity-70' : 'primary-button';
  const preClass = tailwind ? 'mt-6 min-h-28 overflow-auto rounded-md border border-zinc-800 bg-zinc-950 p-4 text-sm text-sky-200' : 'response-box';

  if (serverless) {
    return String.raw`import { useEffect, useState } from 'react';
import { Server, Sparkles, TerminalSquare } from 'lucide-react';
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
          <div className="eyebrow">
            <Sparkles size={18} />
            Scafkit React Serverless
          </div>
          <h1>React TypeScript with serverless endpoints.</h1>
          <p>
            Client code, API calls, services, types, and Netlify functions are organized so the app can grow without turning into a drawer of loose files.
          </p>
          <button className="${buttonClass}" onClick={loadServerlessMessage} disabled={apiState.status === 'loading'}>
            <Server size={18} />
            Call function
          </button>
          <pre className="${preClass}">{apiState.message}</pre>
        </section>
        <aside className="${asideClass}">
          <TerminalSquare size={24} />
          <h2>Project shape</h2>
          <p>
            Start in src/app for app shell work, src/features for product behavior, and src/lib for reusable browser infrastructure.
          </p>
        </aside>
      </div>
    </main>
  );
}
`;
  }

  return String.raw`import { useMemo, useState } from 'react';
import { Boxes, Cpu, LibraryBig } from 'lucide-react';
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
          <div className="eyebrow">
            <Boxes size={18} />
            Scafkit React TypeScript
          </div>
          <h1>Frontend app with a real client-side architecture.</h1>
          <p>
            The scaffold separates app shell, reusable components, features, services, adapters, API clients, types, and utilities.
          </p>
          <button className="${buttonClass}" onClick={runClientDemo}>
            <Cpu size={18} />
            Run client demo
          </button>
          <pre className="${preClass}">{result}</pre>
        </section>
        <aside className="${asideClass}">
          <LibraryBig size={24} />
          <h2>Senior-friendly layout</h2>
          <p>
            Put product modules in src/features and reusable infrastructure in src/lib so ownership stays obvious as the codebase grows.
          </p>
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
  }
}

@layer components {
  .eyebrow {
    @apply mb-4 inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-sky-300;
  }
}
`;
  }

  return String.raw`:root {
  color: #e5e7eb;
  background: #18181b;
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
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
  background: #18181b;
  color: #e5e7eb;
}

.app-grid {
  width: min(1120px, calc(100vw - 2rem));
  min-height: 100vh;
  margin: 0 auto;
  padding: 3rem 0;
  display: grid;
  grid-template-columns: minmax(0, 1.5fr) minmax(280px, 0.8fr);
  gap: 1.5rem;
  align-content: center;
}

.hero-panel,
.side-panel {
  border: 1px solid rgba(161, 161, 170, 0.22);
  border-radius: 8px;
  background: #27272a;
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.35);
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
  color: #7dd3fc;
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
  color: #d4d4d8;
  line-height: 1.75;
}

.primary-button {
  border: 0;
  border-radius: 6px;
  padding: 0.85rem 1rem;
  background: #38bdf8;
  color: #082f49;
  font-weight: 800;
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
  border-radius: 6px;
  color: #bae6fd;
  background: #09090b;
  border: 1px solid rgba(161, 161, 170, 0.22);
}

@media (max-width: 850px) {
  .app-grid {
    grid-template-columns: 1fr;
    padding: 2rem 0;
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
