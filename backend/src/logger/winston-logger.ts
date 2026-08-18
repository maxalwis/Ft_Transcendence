import { createLogger, format, transports } from 'winston';
import { LogstashTcpTransport } from './logstash-tcp.transport';

export const WinstonInstance = createLogger({
  level: 'info', // Sets the minimum level for the entire logger
  format: format.combine(format.timestamp(), format.json()),
  transports: [
    new LogstashTcpTransport({
      host: process.env.LOGSTASH_HOST || 'logstash',
      port: 5044,
    }),
  ],
});
