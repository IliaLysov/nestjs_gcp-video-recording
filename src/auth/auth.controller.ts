import { Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import { LocalAuthGuard } from './localStrategy/local-auth.guard';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  @UseGuards(LocalAuthGuard) //gives the user inside req.user
  @Post('login')
  async login(@Req() req, @Res() res) {
    const accessToken = await this.authService.login(req.user);
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
    });
    res.redirect('/video');
  }
}
