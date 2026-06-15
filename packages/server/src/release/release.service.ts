import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { ErrorCode } from '@dualler/shared';

export interface Release {
  id: string;
  appId: string;
  packageId: string;
  version: string;
  grayConfig?: {
    percentage: number;
    userWhitelist: string[];
  };
  status: 'pending' | 'active' | 'rollback';
  createdAt: Date;
}

@Injectable()
export class ReleaseService {
  private releases: Release[] = [];
  private idCounter = 1;

  create(appId: string, packageId: string, version: string, grayConfig?: { percentage: number; userWhitelist: string[] }) {
    if (grayConfig && (grayConfig.percentage < 0 || grayConfig.percentage > 100)) {
      throw new ForbiddenException(ErrorCode.GRAY_CONFIG_INVALID, 'Invalid gray config');
    }

    const release: Release = {
      id: String(this.idCounter++),
      appId,
      packageId,
      version,
      grayConfig,
      status: 'pending',
      createdAt: new Date(),
    };
    this.releases.push(release);
    return release;
  }

  findByAppId(appId: string, page = 1, pageSize = 10) {
    const filtered = this.releases.filter(r => r.appId === appId);
    const start = (page - 1) * pageSize;
    return {
      items: filtered.slice(start, start + pageSize),
      total: filtered.length,
      page,
      pageSize,
    };
  }

  findById(id: string) {
    const release = this.releases.find(r => r.id === id);
    if (!release) throw new NotFoundException(ErrorCode.VERSION_NOT_FOUND, 'Release not found');
    return release;
  }

  activate(id: string) {
    const release = this.findById(id);
    release.status = 'active';
    return release;
  }

  rollback(id: string) {
    const release = this.findById(id);
    release.status = 'rollback';
    return release;
  }
}
