export declare class AuthService {
    private users;
    constructor();
    login(username: string, password: string): Promise<{
        token: string;
        user: {
            id: string;
            username: string;
            role: string;
        };
    }>;
    validateUser(userId: string): Promise<{
        id: string;
        username: string;
        passwordHash: string;
        role: string;
    } | null>;
}
