import { createLogger, format, transports } from 'winston';
import { LogstashTcpTransport } from './logstash-tcp.transport';

const loggerTransports =
  process.env.NODE_ENV === 'test'
    ? [new transports.Console()]
    : [
        new LogstashTcpTransport({
          host: process.env.LOGSTASH_HOST || 'logstash',
          port: 5044,
        }),
      ];

export const WinstonInstance = createLogger({
  level: 'info',
  format: format.combine(format.timestamp(), format.json()),
  transports: loggerTransports,
});