import { Event } from '../structures/Event'

export default class MessageUpdateEvent extends Event {
    run (oldMessage, newMessage) {
        if (oldMessage.author.id !== this.user.id)
            this.emit('message', newMessage)
    }
}
