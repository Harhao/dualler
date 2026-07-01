import { PatchInstruction } from './types';

export function applyPatches(root: any, patches: PatchInstruction[]): any {
  // Deep clone root
  const copy = JSON.parse(JSON.stringify(root));
  for (const patch of patches) {
    applyPatch(copy, patch.path, patch.op, patch.value);
  }
  return copy;
}

function applyPatch(obj: any, path: string, op: string, value?: any): void {
  const parts = path.split('/').filter(Boolean);
  let current = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    current = current[parts[i]];
  }
  const key = parts[parts.length - 1];
  if (op === 'remove') {
    if (Array.isArray(current)) {
      current.splice(Number(key), 1);
    } else {
      delete current[key];
    }
  } else {
    current[key] = value;
  }
}
