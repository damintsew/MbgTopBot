import MessageDao from "../dao/MessageDao";
import {Api, Bot, Context} from "grammy";
import {MessageEntity} from "../entities/MessageEntity";

export class CommandService {
    constructor(private readonly bot: Bot<Context, Api>, private readonly messageRepository: MessageDao) {
    }

    async onTopCommand(ctx: Context) {
        let {startDay, endDay} = this.timerange();
        let groupId = this.extractGroupId(ctx);

        let topMessages = await this.messageRepository.findTopMessages(startDay, endDay, groupId);
        for (let message of topMessages) {
            if (ctx.chat.type == "supergroup" || ctx.chat.type == "group") {
                await this.processGroupAnswer(message, ctx);
            } else {
                await this.processPrivateAnswer(groupId, message, ctx);
            }
        }
    }

    private timerange() {
        let startDay = new Date()
        startDay.setHours(0, 0, 0, 0);
        let endDay = new Date()
        endDay.setHours(23, 59, 59)
        return {startDay, endDay};
    }

    private extractGroupId(ctx: Context) {
        let groupId: number
        if (ctx.chat.type == "supergroup" || ctx.chat.type == "group") {
            return ctx.chat.id
        } else {
            return -1001744562347
        }
    }

    private async processPrivateAnswer(groupId: number, message: MessageEntity, ctx: Context) {
        let chat_id = groupId.toString().slice(4);
        let link = `https://t.me/c/${chat_id}/${message.messageId}`
        let textMessage = await ctx.reply(`Реакций: ${message.reactions}. cообщениe ${link}`)
        try {
            await this.bot.api.forwardMessage(ctx.chat.id, message.chat.chatId, message.messageId)
        } catch (e) { //todo handle 400 bad request
            // Error in case of original message was deleted\
            //todo delete message from DB
            await ctx.deleteMessages([textMessage.message_id])
            return;
        }

        await ctx.reply(`-------------------`)
    }

    private async processGroupAnswer(message: MessageEntity, ctx: Context) {
        let text = `Количество лайков ${message.reactions}`
        await this.bot.api.sendMessage(ctx.chat.id, text, {
            reply_parameters: {
                message_id: message.messageId,
                chat_id: ctx.chat.id,
                allow_sending_without_reply: true
            }
        })
    }
}
