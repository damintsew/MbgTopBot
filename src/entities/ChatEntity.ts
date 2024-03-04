import "reflect-metadata";
import {Entity, PrimaryGeneratedColumn, Column, ManyToOne} from "typeorm";

@Entity('chats')
export class ChatEntity {

    @PrimaryGeneratedColumn({type: "bigint"})
    id: number;

    @Column({ type: "bigint"})
    chatId: number;

    @Column()
    name: string;

    @Column()
    type: string;
}
