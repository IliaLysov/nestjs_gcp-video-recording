import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { AppGateway } from './app.gateway';
import { JwtModule } from '@nestjs/jwt';
import { GcsModule } from './gcs/gcs.module';
import { EmailModule } from './email/email.module';
import { VideoModule } from './video/video.module';

@Global()
@Module({
    imports: [
        TypeOrmModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                type: 'postgres',
                host: configService.get('DATABASE_HOST'),
                port: configService.get('DATABASE_PORT'),
                username: configService.get('DATABASE_USER'),
                password: configService.get('DATABASE_PASSWORD'),
                database: configService.get('DATABASE_NAME'),
                autoLoadEntities: true,
                synchronize: true,
            }),
        }),
        ConfigModule.forRoot(),
        JwtModule.registerAsync({
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => {
                return {
                    secret: configService.get('JWT_SECRET'),
                };
            },
        }),
        UserModule,
        AuthModule,
        GcsModule,
        EmailModule,
        VideoModule,
    ],
    exports: [
        UserModule,
        ConfigModule,
        JwtModule,
        GcsModule,
        EmailModule,
        VideoModule,
    ],
    controllers: [AppController],
    providers: [AppGateway],
})
export class AppModule {}
