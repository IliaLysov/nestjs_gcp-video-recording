import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { createCA, createCert } from 'mkcert';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { ValidationPipe } from '@nestjs/common';
import { getMainUrl, primaryAddress } from './utils/url';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
    let httpsOptions = null;

    if (process.env.NODE_ENV === 'development') {
        const ca = await createCA({
            organization: 'NestJS',
            countryCode: 'GE',
            state: 'Georgia',
            locality: 'Batumi',
            validity: 365,
        });

        const cert = await createCert({
            ca: { key: ca.key, cert: ca.cert },
            domains: [primaryAddress(), '127.0.0.1', 'localhost'],
            validity: 365,
        });

        httpsOptions = {
            key: cert.key,
            cert: cert.cert,
        };
    }

    const app = await NestFactory.create<NestExpressApplication>(AppModule, {
        httpsOptions,
    });
    app.enableCors();

    app.useStaticAssets(join(__dirname, '..', '/public'));
    app.setBaseViewsDir(join(__dirname, '..', '/views'));
    app.setViewEngine('hbs');
    app.use(cookieParser());
    app.useGlobalPipes(
        new ValidationPipe({
            transform: true,
            whitelist: true,
        }),
    );

    await app.listen(process.env.PORT || 8080, async () => {
        console.log(`Server started on ${getMainUrl()}`);
    });
}
bootstrap();
