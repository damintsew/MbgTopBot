import {MessageEntity} from "../entities/MessageEntity";
import {Repository} from "typeorm";
import {ChatEntity} from "../entities/ChatEntity";
import MessageDao from "../dao/MessageDao";
import {Context} from "grammy";
import {Chat} from "@grammyjs/types/manage";


export class MessageService {
    constructor(private readonly messageRepository: MessageDao) {
    }

    async onMessage(ctx: Context) {
        if (ctx.message.chat.type === "private") {
            return;
        }

        let chat: ChatEntity;
        if (ctx.message.chat.type === "group" || ctx.message.chat.type === "supergroup") {
            chat = await this.messageRepository.getChat(ctx.chat.id);
            if (!chat) {
                chat = await this.createChat(ctx.chat as Chat.GroupChat | Chat.SupergroupChat);
            }
        }

        return await this.messageRepository.saveMessage({
            id: null,
            messageId: ctx.message.message_id,
            date: new Date(ctx.message.date * 1000),
            reactions: 0,
            chat: chat
        });
    }

    private async createChat(ctx: Chat.GroupChat | Chat.SupergroupChat) {
        let chat = new ChatEntity();
        chat.chatId = ctx.id;
        chat.name = ctx.title;
        chat.type = ctx.type;
        return await this.messageRepository.saveChat(chat);
    }
}
