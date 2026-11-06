import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
export declare class AuthService {
    private readonly prisma;
    private readonly jwtService;
    private readonly logger;
    constructor(prisma: PrismaService, jwtService: JwtService);
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
    getProfile(userId: string): Promise<{
        id: string;
        email: string;
        name: string;
        initials: string;
        tone: string;
        role: string;
        createdAt: Date;
    }>;
    private generateTokens;
}
