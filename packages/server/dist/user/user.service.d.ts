import { User } from './entities/user.entity';
export declare class UserService {
    private users;
    findAll(page?: number, pageSize?: number): {
        items: User[];
        total: number;
        page: number;
        pageSize: number;
    };
    findById(id: string): User | undefined;
}
