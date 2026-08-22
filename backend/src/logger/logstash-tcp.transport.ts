import Transport, { TransportStreamOptions } from 'winston-transport';
import * as net from 'net';

// 1. Extend TransportStreamOptions so TypeScript knows about base winston options + your custom ones
export interface LogstashTransportOptions extends TransportStreamOptions {
  host: string;
  port: number;
}

export class LogstashTcpTransport extends Transport {
  private client!: net.Socket;
  private host: string;
  private port: number;
  private isConnected: boolean = false;

  // 2. Use your extended interface in the constructor
  constructor(opts: LogstashTransportOptions) {
    super(opts);
    this.host = opts.host;
    this.port = opts.port;
    this.connect();
  }

  private connect() {
    this.client = new net.Socket();

    this.client.on('error', () => {
      this.isConnected = false;
    });

    this.client.on('close', () => {
      this.isConnected = false;
      setTimeout(() => this.connect(), 5000);
    });

    this.client.connect(this.port, this.host, () => {
      this.isConnected = true;
    });
  }

  public log(info: any, callback: () => void) {
    setImmediate(() => {
      this.emit('logged', info);
    });

    if (this.isConnected && this.client.writable) {
      try {
        this.client.write(JSON.stringify(info) + '\n');
      } catch {
        // Fail silently
      }
    }

    callback();
  }
}
