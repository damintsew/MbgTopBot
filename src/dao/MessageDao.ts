import {DataSource} from "typeorm";
import {MessageEntity} from "../entities/MessageEntity";
import {ChatEntity} from "../entities/ChatEntity";

export const AppDataSource = new DataSource({
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: "postgres",
    password: "postgres",
    database: "mbg_top",
    synchronize: true,
    logging: true,
    entities: [MessageEntity, ChatEntity],
    subscribers: [],
    migrations: [],
})

class MessageDao {

    async saveMessage(message: MessageEntity) {
        return AppDataSource.getRepository(MessageEntity)
            .save(message);
    }

    async findTopMessages(startDate: Date, endDate: Date, number: number): Promise<MessageEntity[]> {
        return AppDataSource.getRepository(MessageEntity)
            .createQueryBuilder("message")
            .leftJoinAndSelect("message.chat", "chat")
            .select()
            .where("message.date BETWEEN :startDate AND :endDate", {startDate, endDate})
            .andWhere("message.reactions > 0")
            .andWhere("chat.chatId = :number", {number})
            .orderBy("message.reactions", "DESC")
            .limit(10)
            .getMany();
    }

    async updateReactions(messageId: number, reactionChange: number) {
        return AppDataSource.getRepository(MessageEntity)
            .createQueryBuilder()
            .update(MessageEntity)
            .set({
                reactions: ()=> `reactions + ${reactionChange}`
            })
            .where("messageId = :messageId", {messageId: messageId})
            .execute();
    }

    getChat(id: number) {
        return AppDataSource.getRepository(ChatEntity)
            .findOne({where: {chatId: id}});
    }

    saveChat(chat: ChatEntity) {
        return AppDataSource.getRepository(ChatEntity)
            .save(chat);
    }
}

export default MessageDao;

// const messageRepository = AppDataSource.getRepository(MessageEntity);
// const message = messageRepository.create({
//     date: new Date(),
//     reactions: 5
// });
//
// messageRepository.save(message).then(savedMessage => console.log(savedMessage));
// }).catch(error => console.log(error));
