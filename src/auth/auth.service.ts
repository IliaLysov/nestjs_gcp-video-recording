import { faker } from '@faker-js/faker';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { EmailService } from 'src/email/email.service';
import { User } from 'src/entities/user.entity';
import { Verification } from 'src/entities/verification.entity';
import { UserService } from 'src/user/user.service';
import { comparePassword } from 'src/utils/passport';
import { UserInfo } from 'src/utils/types';
import { Repository } from 'typeorm';

@Injectable()
export class AuthService {
    constructor(
        private userService: UserService,
        private jwtService: JwtService,
        private emailService: EmailService,
        @InjectRepository(Verification)
        private verificationRepository: Repository<Verification>,
    ) {}

    async validateUser(email: string, pass: string): Promise<User | null> {
        const user = await this.userService.findOne(email);
        if (!user) return null;
        const isValidate = await comparePassword(pass, user.password);
        if (!isValidate) return null;
        return user;
    }

    async login({ id, email }: User): Promise<string> {
        const accessToken = this.jwtService.sign({ sub: id, email });
        await this.userService.updateAccessToken(email, accessToken);
        return accessToken;
    }

    verifyAccessToken(accessToken: string): UserInfo | null {
        try {
            const { sub: id, email } = this.jwtService.verify(accessToken);
            return { id, email };
        } catch (error) {
            return null;
        }
    }

    async generateAndSendAuthCode(email: string): Promise<void> {
        const code = faker.number.int({ min: 100000, max: 999999 }).toString();
        await this.verificationRepository.upsert(
            { email, code, updatedAt: new Date() },
            ['email'],
        );
        await this.emailService.sendEmail(
            email,
            'Authentication Code',
            `Your authentication code is: <h3>${code}</h3>`,
        );
    }

    async verifyAuthCode(email: string, code: string): Promise<boolean> {
        const verification = await this.verificationRepository.findOneBy({
            email,
            code,
        });
        if (!verification) return false;
        await this.verificationRepository.delete({ email });
        return true;
    }
}
