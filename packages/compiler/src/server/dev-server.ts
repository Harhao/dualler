import { createServer, IncomingMessage, ServerResponse, Server } from 'http';
import { readFileSync, existsSync, statSync } from 'fs';
import { join, extname, resolve } from 'path';

export interface DevServerOptions {
  /** Port to listen on (default: 8080) */
  port?: number;
  /** Host to bind to (default: localhost) */
  host?: string;
  /** Root directory to serve files from */
  root: string;
  /** Enable CORS headers */
  cors?: boolean;
  /** Proxy API requests to this URL */
  proxy?: string;
}

const MIME_TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
};

/**
 * Development server for previewing compiled mini-programs
 *
 * Features:
 * - Static file serving
 * - CORS support for WebView
 * - API proxy (optional)
 * - WebSocket for hot reload (future)
 */
export class DevServer {
  private server: Server | null = null;
  private options: Required<DevServerOptions>;

  constructor(options: DevServerOptions) {
    this.options = {
      port: 8080,
      host: 'localhost',
      cors: true,
      proxy: undefined as any,
      ...options,
    };
  }

  /**
   * Start the development server
   */
  async start(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.server = createServer((req, res) => {
        this.handleRequest(req, res);
      });

      this.server.on('error', (err: NodeJS.ErrnoException) => {
        if (err.code === 'EADDRINUSE') {
          console.error(`❌ Port ${this.options.port} is already in use`);
        }
        reject(err);
      });

      this.server.listen(this.options.port, this.options.host, () => {
        console.log(`\n🌐 Dev Server started`);
        console.log(`   URL: http://${this.options.host}:${this.options.port}`);
        console.log(`   Root: ${this.options.root}\n`);
        resolve();
      });
    });
  }

  /**
   * Stop the development server
   */
  async stop(): Promise<void> {
    return new Promise((resolve) => {
      if (this.server) {
        this.server.close(() => {
          this.server = null;
          resolve();
        });
      } else {
        resolve();
      }
    });
  }

  /**
   * Handle incoming HTTP requests
   */
  private handleRequest(req: IncomingMessage, res: ServerResponse): void {
    const url = new URL(req.url ?? '/', `http://${req.headers.host}`);
    let pathname = url.pathname;

    // CORS headers
    if (this.options.cors) {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

      if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
      }
    }

    // Default to index.html for root
    if (pathname === '/') {
      pathname = '/index.html';
    }

    // Resolve file path
    const filePath = join(this.options.root, pathname);

    // Security: prevent directory traversal
    if (!filePath.startsWith(this.options.root)) {
      res.writeHead(403);
      res.end('Forbidden');
      return;
    }

    // Check if file exists
    if (!existsSync(filePath) || !statSync(filePath).isFile()) {
      // Try with .html extension
      const htmlPath = filePath + '.html';
      if (existsSync(htmlPath)) {
        this.serveFile(htmlPath, res);
        return;
      }

      res.writeHead(404);
      res.end('Not Found');
      return;
    }

    this.serveFile(filePath, res);
  }

  /**
   * Serve a static file
   */
  private serveFile(filePath: string, res: ServerResponse): void {
    try {
      const content = readFileSync(filePath);
      const ext = extname(filePath);
      const contentType = MIME_TYPES[ext] ?? 'application/octet-stream';

      res.writeHead(200, {
        'Content-Type': contentType,
        'Cache-Control': 'no-cache',
      });
      res.end(content);
    } catch (err) {
      res.writeHead(500);
      res.end('Internal Server Error');
    }
  }
}

/**
 * Create and start a dev server for a compiled mini-program
 */
export async function startDevServer(
  outputDir: string,
  port: number = 8080,
): Promise<DevServer> {
  const server = new DevServer({
    root: outputDir,
    port,
    cors: true,
  });

  await server.start();
  return server;
}
