import { createLogger, format, transports } from 'winston';
import { LogstashTcpTransport } from './logstash-tcp.transport';

export const WinstonInstance = createLogger({
  format: format.combine(
    format.timestamp(),
    format.json()
  ),
  transports: [
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.simple()
      ),
      level: 'warn', // Keeps console clean, only showing warnings and errors locally
    }),
    new LogstashTcpTransport({
      host: process.env.LOGSTASH_HOST || 'logstash',
      port: 5044,
    }),
  ],
});