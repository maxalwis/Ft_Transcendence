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
  info: (msg: string) => {
    // Format regular Vite info logs (like server startup or HMR updates)
    console.log(
      `${CYAN}[Vite]      - ${RESET}${getTimestamp()}`,
      `${CYAN}    LOG ${YELLOW}[Client]${CYAN}`,
      msg,
      `${RESET}`
    );
  },
  warn: (msg: string) => {
    console.warn(
      `${YELLOW}[Vite]      - ${RESET}${getTimestamp()}`,
      `${YELLOW}     WARN ${YELLOW}[Client]${YELLOW}`,
      msg,
      `${RESET}`
    );
  },
  error: (msg: string) => {
    console.error(
      `${RED}[Vite]      - ${RESET}${getTimestamp()}`,
      `${RED}     ERROR ${YELLOW}[Client]${RED}`,
      msg,
      `${RESET}`
    );
  },
};

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  const backendUrl = process.env.VITE_BACKEND_URL || env.VITE_BACKEND_URL || 'http://backend:3000';

  return {
    customLogger,
    plugins: [react(), tailwindcss()],
    server: {
      host: true,
      hmr: {
        protocol: 'wss',
        clientPort: Number(process.env.HTTPS_PORT || env.HTTPS_PORT) || 8443,
      },
      proxy: {
        '/api': {
          target: backendUrl,
          changeOrigin: true,
          // 2. Log proxy connection errors to terminal
          configure: (proxy) => {
            proxy.on('error', (err, _req, _res) => {
              console.error(`${RED}[Vite Proxy Error] ${err.message}${RESET}`);
            });
          },
        },
      },
    },
  };
});
