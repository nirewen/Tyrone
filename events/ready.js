import { Logger } from '../structures/Logger'
import { Structures, MessageAttachment } from 'discord.js'

let logger = new Logger()

export default function () {
    logger.logWithHeader('PRONTO', 'bgGreen', 'white', `S: ${this.guilds.size} | U: ${this.users.size} | MÉD: ${(this.users.size / this.guilds.size).toFixed(2)} | PID: ${process.pid}`)

    Structures.get('Message').prototype.send = async function (content, options) {
        if (this.response) {
            if (content instanceof MessageAttachment || options instanceof MessageAttachment)
                await this.response.delete()

            if (this.collector)
                this.collector.stop()

            return this.response.edit(content, options)
        }

        this.response = await this.channel.send(content, options)

        return this.response
    }
}
