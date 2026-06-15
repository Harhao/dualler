export class Package {
  id: string;
  appId: string;
  version: string;
  releaseNote: string;
  packageSize: number;
  sha256: string;
  downloadUrl: string;
  status: 'draft' | 'published' | 'unpublished';
  forceUpdate: boolean;
  publishedAt: Date | null;
  createdAt: Date;
}

export class Patch {
  id: string;
  appId: string;
  baseVersion: string;
  targetVersion: string;
  patchSize: number;
  sha256: string;
  downloadUrl: string;
  createdAt: Date;
}
