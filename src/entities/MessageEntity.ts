import "reflect-metadata";
import {Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinTable} from "typeorm";
import {ChatEntity} from "./ChatEntity";

@Entity('messages')
export class MessageEntity {

    @PrimaryGeneratedColumn({type: "bigint"})
    id: number;

    @Column({ type: "bigint"})
    messageId?: number;

    @Column()
    date: Date;

    @Column()
    reactions: number;

    // @Column({nullable: false})
    @JoinTable()
    @ManyToOne(() => ChatEntity, message => message.id, {nullable: false})
    chat: ChatEntity;
}
