import { startDevServer } from './server';

export async function runDevServer(port: number = 3000, root: string = '.') {
  return startDevServer(port, root);
}
