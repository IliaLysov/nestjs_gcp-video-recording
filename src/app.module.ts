import { Global, Module } from '@nestjs/common';
import { VideoModule } from './video/video.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { JwtModule } from '@nestjs/jwt';

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
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        isGlobal: true,
      }),
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    UserModule,
    VideoModule,
    AuthModule,
  ],
  exports: [UserModule, ConfigModule, JwtModule],
  controllers: [AppController],
})
export class AppModule {}
