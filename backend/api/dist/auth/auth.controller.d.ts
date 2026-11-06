import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(dto: RegisterDto): Promise<{
        accessToken: string;
        refreshToken: string;
        expiresIn: number;
        user: {
            id: string;
            email: string;
            name: string;
            initials: string;
            tone: string;
            role: string;
        };
        workspace: {
            id: string;
            name: string;
            slug: string;
        };
    }>;
    login(dto: LoginDto): Promise<{
        accessToken: string;
        refreshToken: string;
        expiresIn: number;
        user: {
            id: string;
            email: string;
            name: string;
            initials: string;
            tone: string;
            role: string;
        };
        workspace: {
            id: string;
            name: string;
            slug: string;
        };
    }>;
    refresh(dto: RefreshDto): Promise<{
        accessToken: string;
        refreshToken: string;
        expiresIn: number;
    }>;
    getProfile(req: any): Promise<{
        id: string;
        email: string;
        name: string;
        initials: string;
        tone: string;
        role: string;
        createdAt: Date;
    }>;
    logout(): {
        success: boolean;
        message: string;
    };
}
