export interface PatchInstruction {
  op: 'add' | 'update' | 'remove' | 'move';
  path: string;
  value?: any;
  fromPath?: string;
}
