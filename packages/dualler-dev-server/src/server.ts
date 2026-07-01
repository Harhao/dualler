import express, { Request, Response } from 'express';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { createWatcher } from './watch';
import { compileAndUpdate } from './hmr';

interface ClientConnection {
  ws: WebSocket;
  readyState: number;
}

export function startDevServer(port: number, root: string) {
  const app = express();
  const httpServer = createServer(app);
  const wss = new WebSocketServer({ server: httpServer });

  // Serve compiled bundles from dist directory
  app.use(express.static(`${root}/dist`));

  app.get('/dualler-config.json', (_req: Request, res: Response) => {
    res.json({ port, root });
  });

  // HMR: clients connect and trigger recompilation
  wss.on('connection', (ws: WebSocket) => {
    console.log(`[dev-server] Client connected (total: ${wss.clients.size})`);

    ws.on('message', async (data) => {
      const msg = data.toString().trim();
      if (msg === 'reload' || msg === 'hmr') {
        await compileAndUpdate(root, (patches) => {
          ws.send(JSON.stringify({ type: 'patches', patches }));
        });
      }
    });

    ws.on('close', () => {
      console.log('[dev-server] Client disconnected');
    });
  });

  // Set up file watching for hot reload
  createWatcher(root, async (changedFiles) => {
    console.log(`[dev-server] Files changed: ${changedFiles.join(', ')}`);
    await compileAndUpdate(root, (patches) => {
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ type: 'patches', patches }));
        }
      });
    });
  });

  return new Promise<void>((resolve) => {
    httpServer.listen(port, () => {
      console.log(`[dev-server] Running at http://localhost:${port}`);
      console.log(`[dev-server] Root: ${root}`);
      resolve();
    });
  });
}
