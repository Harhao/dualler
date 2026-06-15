export declare class StorageService {
    upload(file: {
        buffer: Buffer;
        originalname: string;
        mimetype: string;
        size: number;
    }): Promise<{
        key: string;
        url: string;
        size: number;
        contentType: string;
    }>;
    getPresignedUrl(key: string): Promise<{
        url: string;
        expiresAt: Date;
    }>;
}
