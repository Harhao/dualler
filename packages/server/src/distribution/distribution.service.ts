import { Injectable, NotFoundException } from '@nestjs/common';
import { ErrorCode } from '@dualler/shared';

export interface Distribution {
  id: string;
  appId: string;
  version: string;
  platform: 'android' | 'ios' | 'web';
  downloadUrl: string;
  qrCodeUrl: string;
  createdAt: Date;
}

@Injectable()
export class DistributionService {
  private distributions: Distribution[] = [];
  private idCounter = 1;

  create(appId: string, version: string, platform: 'android' | 'ios' | 'web', downloadUrl: string) {
    const distribution: Distribution = {
      id: String(this.idCounter++),
      appId,
      version,
      platform,
      downloadUrl,
      qrCodeUrl: `https://api.example.com/qr/${appId}/${version}/${platform}`,
      createdAt: new Date(),
    };
    this.distributions.push(distribution);
    return distribution;
  }

  findByAppId(appId: string, page = 1, pageSize = 10) {
    const filtered = this.distributions.filter(d => d.appId === appId);
    const start = (page - 1) * pageSize;
    return {
      items: filtered.slice(start, start + pageSize),
      total: filtered.length,
      page,
      pageSize,
    };
  }

  findById(id: string) {
    const distribution = this.distributions.find(d => d.id === id);
    if (!distribution) throw new NotFoundException(ErrorCode.NOT_FOUND, 'Distribution not found');
    return distribution;
  }
}
