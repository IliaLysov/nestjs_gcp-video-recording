import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { comparePassword } from 'src/utils/passport';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private readonly jwtService: JwtService,
  ) {}
  async signIn(email: string, password: string): Promise<string | null> {
    const user = await this.userService.findOne(email);
    console.log('user', user);

    if (!user) return null;

    const isPasswordValid = await comparePassword(password, user.password);
    console.log('isPasswordValid', isPasswordValid);

    if (!isPasswordValid) throw new UnauthorizedException();

    const accessToken = this.jwtService.sign({ sub: user.id, email });
    console.log('accessToken', accessToken);

    return accessToken;
  }
}
