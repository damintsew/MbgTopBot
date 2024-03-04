import {Bot} from "grammy";
import MessageDao, {AppDataSource} from "./src/dao/MessageDao";
import {deflateRaw} from "node:zlib";
import {ChatEntity} from "./src/entities/ChatEntity";

AppDataSource.initialize()
const messageRepository = new MessageDao();

// Create an instance of the `Bot` class and pass your bot token to it.
const bot = new Bot("6657860652:AAGyg8sCHGGpF3gkr8g921mkZoy7WFmsR0o"); // <-- put your bot token between the ""

// You can now register listeners on your bot object `bot`.
// grammY will call the listeners when users send messages to your bot.

// Handle the /start command.
bot.command("start", (ctx) => {
    ctx.reply("Fuck you!")
});
bot.command("top", async (ctx) => {
    ctx.react("🖕")

    let startDay = new Date()
    startDay.setHours(0, 0, 0, 0);
    let endDay = new Date()
    endDay.setHours(23, 59, 59)

    let groupId: number
    if (ctx.chat.type == "supergroup" || ctx.chat.type == "group") {
        groupId = ctx.chat.id
    } else {
        groupId = -1001744562347
    }

    let res = await messageRepository.findTopMessages(startDay, endDay, groupId);
    for (let message of res) {
        if (ctx.chat.type == "supergroup" || ctx.chat.type == "group") {
            let text = `Количество лайков ${message.reactions}`
            await bot.api.sendMessage(ctx.chat.id, text, {
                reply_parameters: {
                    message_id: message.messageId,
                    chat_id: ctx.chat.id,
                    allow_sending_without_reply: true
                }
            })
        } else {
            let chat_id = groupId.toString().slice(4);
            let link = `https://t.me/c/${chat_id}/${message.messageId}`
            let r = await ctx.reply(`Реакций: ${message.reactions}. cообщениe ${link}`)
            try {
                let rres = await bot.api.forwardMessage(ctx.chat.id, message.chat.chatId, message.messageId)
            } catch (e) {
                console.error(e);
                await ctx.deleteMessages([r.message_id])
                continue
            }

            await ctx.reply(`-------------------`)
        }
    }
});
// Handle other messages.
bot.on("message", async (ctx) => {

    let chat: ChatEntity;
    if (ctx.message.chat.type === "private") {
        return;
    } else if (ctx.message.chat.type === "group" || ctx.message.chat.type === "supergroup") {
        chat = await messageRepository.getChat(ctx.chat.id);
        if (!chat) {
            chat = new ChatEntity();
            chat.chatId = ctx.chat.id;
            chat.name = ctx.message.chat.title;
            chat.type = ctx.message.chat.type;
            chat = await messageRepository.saveChat(chat);
        }
    }

    await messageRepository.saveMessage({
        id: null,
        messageId: ctx.message.message_id,
        date: new Date(ctx.message.date * 1000),
        reactions: 0,
        chat: chat
    });
});


bot.on("message_reaction", async (ctx) => {
    const reaction = ctx.messageReaction;
    // We only receive the message identifier, not the message content.
    // The difference between these two lists describes the change.
    const old = reaction.old_reaction; // previous
    const now = reaction.new_reaction; // current

    console.log(old)
    console.log(now)

    await messageRepository.updateReactions(
        reaction.message_id,
        now.length - old.length
    );
});

// Now that you specified how to handle messages, you can start your bot.
// This will connect to the Telegram servers and wait for messages.

// Start the bot.
bot.start({
    allowed_updates: ["message", "message_reaction", "message_reaction_count"],
});
