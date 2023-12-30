import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/user/user.entity';
import { UserService } from 'src/user/user.service';
import { comparePassword } from 'src/utils/passport';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<User | null> {
    console.log('auth.service.validateUser', email, pass);
    const user = await this.userService.findOne(email);
    if (!user) return null;
    const isValidate = await comparePassword(pass, user.password);
    if (!isValidate) return null;
    return user;
  }

  async login({ id, email }: User): Promise<string> {
    console.log('auth.service.login', id, email);
    return this.jwtService.sign({ sub: id, email });
  }
}
