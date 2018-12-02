export async function run (oldMessage, newMessage) {
    if (oldMessage.author.id !== this.user.id)
        this.emit('message', newMessage)
}
