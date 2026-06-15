import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { ErrorCode } from '@dualler/shared';
import { Package, Patch } from './entities/package.entity';

@Injectable()
export class PackageService {
  private packages: Package[] = [];
  private patches: Patch[] = [];
  private idCounter = 1;

  upload(appId: string, version: string, releaseNote: string, file: { size: number; buffer: Buffer }) {
    if (file.size > 20 * 1024 * 1024) {
      throw new BadRequestException(ErrorCode.PACKAGE_TOO_LARGE, 'Package exceeds 20MB');
    }

    const pkg: Package = {
      id: String(this.idCounter++),
      appId,
      version,
      releaseNote,
      packageSize: file.size,
      sha256: 'sha256-placeholder',
      downloadUrl: `https://cdn.example.com/packages/${appId}/${version}.mpkg`,
      status: 'draft',
      forceUpdate: false,
      publishedAt: null,
      createdAt: new Date(),
    };
    this.packages.push(pkg);

    // Generate patch from previous version
    this.generatePatchAsync(appId, version);

    return pkg;
  }

  findByAppId(appId: string, page = 1, pageSize = 10) {
    const filtered = this.packages.filter(p => p.appId === appId);
    const start = (page - 1) * pageSize;
    return {
      items: filtered.slice(start, start + pageSize),
      total: filtered.length,
      page,
      pageSize,
    };
  }

  findById(id: string) {
    const pkg = this.packages.find(p => p.id === id);
    if (!pkg) throw new NotFoundException(ErrorCode.VERSION_NOT_FOUND, 'Package not found');
    return pkg;
  }

  publish(packageId: string) {
    const pkg = this.findById(packageId);
    pkg.status = 'published';
    pkg.publishedAt = new Date();
    return pkg;
  }

  unpublish(packageId: string) {
    const pkg = this.findById(packageId);
    pkg.status = 'unpublished';
    return pkg;
  }

  findPatch(appId: string, baseVersion: string, targetVersion: string) {
    return this.patches.find(p =>
      p.appId === appId && p.baseVersion === baseVersion && p.targetVersion === targetVersion
    );
  }

  private generatePatchAsync(appId: string, newVersion: string) {
    const prevPkg = this.packages
      .filter(p => p.appId === appId && p.status === 'published')
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];

    if (prevPkg) {
      this.patches.push({
        id: String(this.idCounter++),
        appId,
        baseVersion: prevPkg.version,
        targetVersion: newVersion,
        patchSize: 0,
        sha256: 'patch-sha256',
        downloadUrl: `https://cdn.example.com/patches/${appId}/${prevPkg.version}-${newVersion}.patch`,
        createdAt: new Date(),
      });
    }
  }
}
