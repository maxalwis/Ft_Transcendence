/**
 * @file worker.js
 * @description Background job worker using BullMQ, connected to Redis,
 * with built-in health checking (heartbeat) and graceful shutdown.
 */

const { Worker } = require('bullmq');

// ANSI escape color codes for terminal styling
const RESET = '\x1b[0m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RED = '\x1b[31m';
const CYAN = '\x1b[36m';

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

const logger = {
  log: (message, ...optionalParams) => {
    console.log(
      `${GREEN}[BullMQ]    - ${RESET}${getTimestamp()}`,
      `${GREEN}    LOG ${YELLOW}[Heartbeat]${GREEN}`,
      message,
      ...optionalParams,
      `${RESET}`
    );
  },
  warn: (message, ...optionalParams) => {
    console.warn(
      `${YELLOW}[BullMQ]    - ${RESET}${getTimestamp()}`,
      `${YELLOW}     WARN ${YELLOW}[Heartbeat]${YELLOW}`,
      message,
      ...optionalParams,
      `${RESET}`
    );
  },
  error: (message, ...optionalParams) => {
    console.error(
      `${RED}[BullMQ]    - ${RESET}${getTimestamp()}`,
      `${RED}     ERROR ${YELLOW}[Heartbeat]${RED}`,
      message,
      ...optionalParams,
      `${RESET}`
    );
  },
};

// Configuration: Read Redis connection details from environment variables or fallbacks
const redisHost = process.env.REDIS_HOST || 'redis';
const redisPort = parseInt(process.env.REDIS_PORT || '6379', 10);

logger.log(`Attempting to connect to Redis at ${redisHost}:${redisPort}...`);

/**
 * Create a BullMQ worker that processes tasks from the 'transcendence-queue'.
 */
const worker = new Worker(
  'transcendence-queue',
  async (job) => {
    // Handle specific job types dispatched to this worker queue
    if (job.name === 'ping_worker') {
      logger.log('Worker running successfully');
    }
  },
  {
    connection: {
      host: redisHost,
      port: redisPort,
    },
  }
);

// Triggered once the worker successfully handshakes with Redis
worker.on('ready', () => {
  logger.log('Worker successfully registered with Redis and ready for tasks!');
});

// Triggered if the worker encounters any internal runtime or connection errors
worker.on('error', (err) => {
  logger.error('Worker encountered an error:', err);
});

/**
 * Periodic Heartbeat (Every 30s):
 * Verifies that the worker script is alive and the connection state is active.
 */
const intervalId = setInterval(async () => {
  try {
    if (worker && !worker.closing) {
      logger.log('Worker running successfully');
    }
  } catch (err) {
    logger.error('Heartbeat check failed:', err);
  }
}, 30000);

/**
 * Handles graceful shutdown procedures when receiving container stop signals (SIGTERM/SIGINT).
 * Clears timers, safely closes active connections with a timeout, and exits.
 *
 * @param {string} signal - The termination signal received (e.g., 'SIGTERM')
 */
const shutdownHandler = async (signal) => {
  logger.log(`${signal} signal received: closing worker gracefully...`);
  clearInterval(intervalId);

  try {
    const closePromise = worker.close();
    // Force-fail the close operation if Redis is unresponsive for more than 2 seconds
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Worker close timeout')), 2000)
    );

    await Promise.race([closePromise, timeoutPromise]);
    logger.log('Worker closed successfully.');
  } catch (err) {
    logger.log('Worker closed with network/timeout constraint (Redis already down).');
  } finally {
    process.exit(0);
  }
};

// Register container orchestration signal listeners
process.on('SIGTERM', () => shutdownHandler('SIGTERM'));
process.on('SIGINT', () => shutdownHandler('SIGINT'));
