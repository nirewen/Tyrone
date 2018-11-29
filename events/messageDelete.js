import { Event } from '../structures/Event'

export default class MessageDeleteEvent extends Event {
    async run (msg) {
        if (msg.command)
            if (msg.response)
                msg.response.delete()
    }
}
