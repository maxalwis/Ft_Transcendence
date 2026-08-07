/**
 * @file worker.js
 * @description Background job worker using BullMQ, connected to Redis, 
 * with built-in health checking (heartbeat) and graceful shutdown.
 */

const { Worker } = require('bullmq');

/**
 * Generates a formatted local timestamp string matching backend log conventions.
 * @returns {string} Formatted timestamp (e.g., "08/06/2026, 4:12:58 PM")
 */
function getTimestamp() {
    return new Date().toLocaleString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
    });
}

// Configuration: Read Redis connection details from environment variables or fallbacks
const redisHost = process.env.REDIS_HOST || 'redis';
const redisPort = parseInt(process.env.REDIS_PORT || '6379', 10);

console.log(`[${getTimestamp()}] Attempting to connect to Redis at ${redisHost}:${redisPort}...`);

/**
 * Create a BullMQ worker that processes tasks from the 'transcendence-queue'.
 */
const worker = new Worker('transcendence-queue', async job => {
    // Handle specific job types dispatched to this worker queue
    if (job.name === 'ping_worker') {
        console.log(`[${getTimestamp()}] Worker running successfully`);
    }
}, {
    connection: {
        host: redisHost,
        port: redisPort
    }
});

// Triggered once the worker successfully handshakes with Redis
worker.on('ready', () => {
    console.log(`[${getTimestamp()}] Worker successfully registered with Redis and ready for tasks!`);
});

// Triggered if the worker encounters any internal runtime or connection errors
worker.on('error', err => {
    console.error(`[${getTimestamp()}] Worker encountered an error:`, err);
});

/**
 * Periodic Heartbeat (Every 30s):
 * Verifies that the worker script is alive and the connection state is active.
 */
const intervalId = setInterval(async () => {
    try {
        if (worker && !worker.closing) {
            console.log(`[${getTimestamp()}] Worker running successfully (heartbeat 30s)`);
        }
    } catch (err) {
        console.error(`[${getTimestamp()}] Heartbeat check failed:`, err);
    }
}, 30000);

/**
 * Handles graceful shutdown procedures when receiving container stop signals (SIGTERM/SIGINT).
 * Clears timers, safely closes active connections with a timeout, and exits.
 * 
 * @param {string} signal - The termination signal received (e.g., 'SIGTERM')
 */
const shutdownHandler = async (signal) => {
    console.log(`[${getTimestamp()}] ${signal} signal received: closing worker gracefully...`);
    clearInterval(intervalId);

    try {
        const closePromise = worker.close();
        // Force-fail the close operation if Redis is unresponsive for more than 2 seconds
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Worker close timeout')), 2000)
        );

        await Promise.race([closePromise, timeoutPromise]);
        console.log(`[${getTimestamp()}] Worker closed successfully.`);
    } catch (err) {
        console.log(`[${getTimestamp()}] Worker closed with network/timeout constraint (Redis already down).`);
    } finally {
        process.exit(0);
    }
};

// Register container orchestration signal listeners
process.on('SIGTERM', () => shutdownHandler('SIGTERM'));
process.on('SIGINT', () => shutdownHandler('SIGINT'));