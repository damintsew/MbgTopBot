import {Context} from "grammy";
import MessageDao from "../dao/MessageDao";

export class ReactionService {

    constructor(private readonly messageRepository: MessageDao) {
    }

    async onReaction(ctx: Context) {
        const reaction = ctx.messageReaction;
        // We only receive the message identifier, not the message content.
        // The difference between these two lists describes the change.
        const old = reaction.old_reaction; // previous
        const now = reaction.new_reaction; // current

        console.log(old)
        console.log(now)

        await this.messageRepository.updateReactions(
            reaction.message_id,
            now.length - old.length
        );
    }
}
