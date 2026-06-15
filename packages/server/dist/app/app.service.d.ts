import { MiniApp } from './entities/mini-app.entity';
export declare class AppService {
    private apps;
    private idCounter;
    create(dto: {
        appId: string;
        appName: string;
        description?: string;
    }, ownerId: string): MiniApp;
    findAll(page?: number, pageSize?: number): {
        items: MiniApp[];
        total: number;
        page: number;
        pageSize: number;
    };
    findById(id: string): MiniApp;
    update(id: string, dto: Partial<MiniApp>): MiniApp;
    delete(id: string): void;
}
