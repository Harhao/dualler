import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ErrorCode } from '@dualler/shared';

@Injectable()
export class AuthService {
  private users = new Map<string, { id: string; username: string; passwordHash: string; role: string }>();

  constructor() {
    // Default admin user
    this.users.set('admin', {
      id: '1',
      username: 'admin',
      passwordHash: '$2b$10$abcdefghijklmnopqrstuvwxyz', // placeholder
      role: 'admin',
    });
  }

  async login(username: string, password: string) {
    const user = this.users.get(username);
    if (!user) {
      throw new UnauthorizedException(ErrorCode.AUTH_FAILED, 'Invalid credentials');
    }
    // Simplified: in production, verify password hash
    return {
      token: 'jwt-token-' + user.id,
      user: { id: user.id, username: user.username, role: user.role },
    };
  }

  async validateUser(userId: string) {
    for (const user of this.users.values()) {
      if (user.id === userId) return user;
    }
    return null;
  }
}
