import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Video } from './video.entity';

@Entity()
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    email: string;

    @Column()
    password: string;

    @Column({ nullable: true })
    accessToken: string;

    @OneToMany(() => Video, (video) => video.user)
    videos: Video[];
}
