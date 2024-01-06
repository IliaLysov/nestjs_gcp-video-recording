import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './localStrategy/local.strategy';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwtStrategy/jwt.strategy';

@Module({
    imports: [PassportModule],
    controllers: [AuthController],
    providers: [AuthService, LocalStrategy, JwtStrategy],
    exports: [AuthService],
})
export class AuthModule {}
