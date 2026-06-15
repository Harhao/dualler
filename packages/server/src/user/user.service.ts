import { Injectable } from '@nestjs/common';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
  private users: User[] = [];

  findAll(page = 1, pageSize = 10) {
    const start = (page - 1) * pageSize;
    return {
      items: this.users.slice(start, start + pageSize),
      total: this.users.length,
      page,
      pageSize,
    };
  }

  findById(id: string) {
    return this.users.find(u => u.id === id);
  }
}
