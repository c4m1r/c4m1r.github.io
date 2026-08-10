import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const appContextPath = path.join(rootDir, 'src', 'contexts', 'AppContext.tsx');
const appContextCorePath = path.join(rootDir, 'src', 'contexts', 'appContextCore.ts');
const useAppPath = path.join(rootDir, 'src', 'contexts', 'useApp.ts');

const weatherContextPath = path.join(rootDir, 'src', 'contexts', 'WeatherContext.tsx');
const weatherContextCorePath = path.join(rootDir, 'src', 'contexts', 'weatherContextCore.ts');
const useWeatherPath = path.join(rootDir, 'src', 'contexts', 'useWeather.ts');

const appContextContent = fs.readFileSync(appContextPath, 'utf8');
const appContextCoreContent = fs.readFileSync(appContextCorePath, 'utf8');
const useAppContent = fs.readFileSync(useAppPath, 'utf8');

const weatherContextContent = fs.readFileSync(weatherContextPath, 'utf8');
const weatherContextCoreContent = fs.readFileSync(weatherContextCorePath, 'utf8');
const useWeatherContent = fs.readFileSync(useWeatherPath, 'utf8');

const errors = [];

// AppContext assertions
if (appContextContent.includes('createContext')) {
  errors.push('src/contexts/AppContext.tsx must not instantiate createContext directly; it should import AppContext from ./appContextCore');
}

if (!appContextContent.includes("from './appContextCore'")) {
  errors.push("src/contexts/AppContext.tsx must import AppContext from './appContextCore'");
}

if (!appContextCoreContent.includes('export const AppContext = createContext<AppContextType | undefined>(undefined);')) {
  errors.push('src/contexts/appContextCore.ts must export const AppContext = createContext<AppContextType | undefined>(undefined);');
}

if (!useAppContent.includes("from './appContextCore'")) {
  errors.push("src/contexts/useApp.ts must import AppContext from './appContextCore'");
}

// WeatherContext assertions
if (weatherContextContent.includes('createContext')) {
  errors.push('src/contexts/WeatherContext.tsx must not instantiate createContext directly; it should import WeatherContext from ./weatherContextCore');
}

if (!weatherContextContent.includes("from './weatherContextCore'")) {
  errors.push("src/contexts/WeatherContext.tsx must import WeatherContext from './weatherContextCore'");
}

if (!weatherContextCoreContent.includes('export const WeatherContext = createContext<WeatherContextType | undefined>(undefined);')) {
  errors.push('src/contexts/weatherContextCore.ts must export const WeatherContext = createContext<WeatherContextType | undefined>(undefined);');
}

if (!useWeatherContent.includes("from './weatherContextCore'")) {
  errors.push("src/contexts/useWeather.ts must import WeatherContext from './weatherContextCore'");
}

if (errors.length > 0) {
  console.error('Context Boundary Verification Failed:');
  errors.forEach((err) => console.error(` - ${err}`));
  process.exit(1);
}

console.log('Context Boundary Verification Passed: AppContext and WeatherContext identities are unique and correctly connected.');
