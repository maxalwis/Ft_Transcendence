import { defineConfig, createLogger, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// ANSI escape color codes for terminal styling (matching your worker style)
const RESET = '\x1b[0m';
const CYAN = '\x1b[36m';
const YELLOW = '\x1b[33m';
const RED = '\x1b[31m';

/**
 * Helper to generate the current formatted timestamp string.
 */
const getTimestamp = () =>
  new Date().toLocaleString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

const baseLogger = createLogger();

const customLogger = {
  ...baseLogger,
  info: (msg: string, options?: any) => {
    // Format regular Vite info logs (like server startup or HMR updates)
    console.log(
      `${CYAN}[Vite]      - ${RESET}${getTimestamp()}`,
      `${CYAN}    LOG ${YELLOW}[Client]${CYAN}`,
      msg,
      `${RESET}`
    );
  },
  warn: (msg: string, options?: any) => {
    console.warn(
      `${YELLOW}[Vite]      - ${RESET}${getTimestamp()}`,
      `${YELLOW}     WARN ${YELLOW}[Client]${YELLOW}`,
      msg,
      `${RESET}`
    );
  },
  error: (msg: string, options?: any) => {
    console.error(
      `${RED}[Vite]      - ${RESET}${getTimestamp()}`,
      `${RED}     ERROR ${YELLOW}[Client]${RED}`,
      msg,
      `${RESET}`
    );
  },
};

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    customLogger, // <--- Added here so Vite uses your custom logger
    plugins: [react(), tailwindcss()],
    server: {
      host: true,
      hmr: { clientPort: Number(env.HTTP_PORT) || 8080 },
    },
  };
});