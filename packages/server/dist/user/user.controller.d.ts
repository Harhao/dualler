import { UserService } from './user.service';
export declare class UserController {
    private readonly userService;
    constructor(userService: UserService);
    findAll(page?: number, pageSize?: number): {
        items: import("./entities/user.entity").User[];
        total: number;
        page: number;
        pageSize: number;
    };
    findOne(id: string): import("./entities/user.entity").User | undefined;
}
