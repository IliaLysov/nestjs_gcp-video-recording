import { Controller, Get, Render } from '@nestjs/common';
import * as os from 'os';

@Controller()
export class AppController {
  @Get('login')
  @Render('login')
  login() {}

  @Get('registration')
  @Render('registration')
  registration() {
    const netwerkInterfaces = os.networkInterfaces();
    const baseUrl = `https://${netwerkInterfaces.en0[1].address}:${process.env.PORT}/user/create`;
    return {
      registrationUrl: baseUrl,
    };
  }
}
