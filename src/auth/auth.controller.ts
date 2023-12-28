import {
  Body,
  Controller,
  Post,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserDto } from 'src/user/dto/user.dto';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signin')
  async signIn(@Body() user: UserDto, @Res() res: Response) {
    try {
      const accessToken = await this.authService.signIn(
        user.email,
        user.password,
      );

      if (!accessToken) throw new UnauthorizedException();

      res.cookie('accessToken', accessToken, { httpOnly: true, secure: true });
      res.redirect('/video');
    } catch (error) {
      console.log(error);
    }
  }
}
