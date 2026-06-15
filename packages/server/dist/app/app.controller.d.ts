import { AppService } from './app.service';
export declare class AppController {
    private readonly appService;
    constructor(appService: AppService);
    create(dto: {
        appId: string;
        appName: string;
        description?: string;
    }): import("./entities/mini-app.entity").MiniApp;
    findAll(page?: number, pageSize?: number): {
        items: import("./entities/mini-app.entity").MiniApp[];
        total: number;
        page: number;
        pageSize: number;
    };
    findOne(id: string): import("./entities/mini-app.entity").MiniApp;
    update(id: string, dto: any): import("./entities/mini-app.entity").MiniApp;
    delete(id: string): void;
}
