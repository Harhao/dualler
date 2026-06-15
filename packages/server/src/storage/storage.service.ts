import { Injectable, BadRequestException } from '@nestjs/common';
import { ErrorCode } from '@dualler/shared';

@Injectable()
export class StorageService {
  async upload(file: { buffer: Buffer; originalname: string; mimetype: string; size: number }) {
    if (file.size > 50 * 1024 * 1024) {
      throw new BadRequestException(ErrorCode.PACKAGE_TOO_LARGE, 'File exceeds 50MB');
    }

    const key = `uploads/${Date.now()}-${file.originalname}`;
    return {
      key,
      url: `https://storage.example.com/${key}`,
      size: file.size,
      contentType: file.mimetype,
    };
  }

  async getPresignedUrl(key: string) {
    return {
      url: `https://storage.example.com/${key}?expires=3600`,
      expiresAt: new Date(Date.now() + 3600000),
    };
  }
}
