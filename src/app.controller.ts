import { Controller, Get, Render } from '@nestjs/common';
import { getMainUrl } from './utils/url';

@Controller()
export class AppController {
  @Get('signin')
  @Render('signin')
  signIn() {
    return {
      signInUrl: `${getMainUrl()}/auth/signin`,
    };
  }

  @Get('signup')
  @Render('signup')
  signUp() {
    return {
      signUpUrl: `${getMainUrl()}/user/create`,
    };
  }
}
