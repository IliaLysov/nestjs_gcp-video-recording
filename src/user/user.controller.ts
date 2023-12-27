import { Body, Controller, Post, Res } from '@nestjs/common';
import { UserService } from './user.service';
import { UserDto } from './dto/user.dto';
import { Response } from 'express';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Post('create')
  async create(@Body() user: UserDto, @Res() res: Response) {
    try {
      await this.userService.create(user);
      res.redirect('/video');
    } catch (error) {
      console.log(error);
    }
  }
}
