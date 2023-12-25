import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { createCA, createCert } from 'mkcert';

async function bootstrap() {
  const ca = await createCA({
    organization: 'NestJS',
    countryCode: 'GE',
    state: 'Georgia',
    locality: 'Batumi',
    validity: 365,
  });

  const cert = await createCert({
    ca: { key: ca.key, cert: ca.cert },
    domains: ['192.168.18.191', '127.0.0.1', 'localhost'],
    validity: 365,
  });
  const app = await NestFactory.create(AppModule, {
    httpsOptions: {
      key: cert.key,
      cert: cert.cert,
    },
  });
  app.enableCors();
  await app.listen(3000, async () => {
    console.log('Server started on port 3000');
  });
}
bootstrap();
