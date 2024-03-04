import {Bot} from "grammy";
import MessageDao, {AppDataSource} from "./src/dao/MessageDao";
import {MessageService} from "./src/service/MessageService";
import {ReactionService} from "./src/service/ReactionService";
import {CommandService} from "./src/service/CommandService";

const bot = new Bot(process.env.TOKEN); // <-- put your bot token between the ""

const messageRepository = new MessageDao();
const messageService = new MessageService(messageRepository);
const reactionService = new ReactionService(messageRepository);
const commandService = new CommandService(bot, messageRepository);


bot.command("start", async (ctx) => {
    await ctx.reply("Fuck you!")
});
bot.command("top", async (ctx) => {
    await commandService.onTopCommand(ctx);
});

bot.on("message", async (ctx) => {
    await messageService.onMessage(ctx)
});

bot.on("message_reaction", async (ctx) => {
    await reactionService.onReaction(ctx);
});

AppDataSource.initialize().then(() => {
    bot.start({
        allowed_updates: ["message", "message_reaction", "message_reaction_count"],
    });
});
