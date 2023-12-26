import { Controller, Get, Render } from '@nestjs/common';

@Controller('auth')
export class AuthController {
  //   constructor(private readonly authService: AuthService) {}

  @Get('login')
  @Render('login')
  login() {}

  @Get('registration')
  @Render('registration')
  registration() {}
}
