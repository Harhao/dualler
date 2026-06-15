import { Injectable, NotFoundException } from '@nestjs/common';
import { ErrorCode } from '@dualler/shared';
import { MiniApp } from './entities/mini-app.entity';

@Injectable()
export class AppService {
  private apps: MiniApp[] = [];
  private idCounter = 1;

  create(dto: { appId: string; appName: string; description?: string }, ownerId: string) {
    const app: MiniApp = {
      id: String(this.idCounter++),
      appId: dto.appId,
      appName: dto.appName,
      description: dto.description || '',
      ownerId,
      status: 'draft',
      createdAt: new Date(),
    };
    this.apps.push(app);
    return app;
  }

  findAll(page = 1, pageSize = 10) {
    const start = (page - 1) * pageSize;
    return {
      items: this.apps.slice(start, start + pageSize),
      total: this.apps.length,
      page,
      pageSize,
    };
  }

  findById(id: string) {
    const app = this.apps.find(a => a.id === id);
    if (!app) throw new NotFoundException(ErrorCode.APP_NOT_FOUND, 'App not found');
    return app;
  }

  update(id: string, dto: Partial<MiniApp>) {
    const app = this.findById(id);
    Object.assign(app, dto);
    return app;
  }

  delete(id: string) {
    const index = this.apps.findIndex(a => a.id === id);
    if (index === -1) throw new NotFoundException(ErrorCode.APP_NOT_FOUND);
    this.apps.splice(index, 1);
  }
}
