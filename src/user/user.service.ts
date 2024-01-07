import { Injectable } from '@nestjs/common';
import { User } from '../entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserDto } from './dto/user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ) {}

    async create(user: UserDto): Promise<User> {
        const password = await bcrypt.hash(
            user.password,
            await bcrypt.genSalt(10),
        );
        return this.userRepository.save({ ...user, password });
    }

    findOne(email: string): Promise<User | null> {
        return this.userRepository.findOneBy({ email });
    }

    async updateAccessToken(email: string, accessToken: string): Promise<void> {
        await this.userRepository.update({ email }, { accessToken });
    }
}
