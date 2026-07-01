export const logger = {
  info(msg: string) { console.log(`\x1b[36m[dualler]\x1b[0m ${msg}`); },
  success(msg: string) { console.log(`\x1b[32m[dualler]\x1b[0m ${msg}`); },
  warn(msg: string) { console.log(`\x1b[33m[dualler]\x1b[0m ${msg}`); },
  error(msg: string) { console.error(`\x1b[31m[dualler]\x1b[0m ${msg}`); },
};
