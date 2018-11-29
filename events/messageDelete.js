import { Event } from '../structures/Event'

export default class MessageDeleteEvent extends Event {
    async run (msg) {
        if (msg.command)
            msg.response.delete()
    }
}
