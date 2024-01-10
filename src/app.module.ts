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

const ENV = process.env.NODE_ENV;

@Global()
@Module({
    imports: [
        TypeOrmModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                type: 'postgres',
                url: configService.get('DATABASE_URL'),
                autoLoadEntities: true,
                synchronize: true,
            }),
        }),
        ConfigModule.forRoot({
            envFilePath: `.env.${ENV}`,
            isGlobal: true,
        }),
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
