import { Logger } from '../structures/Logger'
import { Structures } from 'discord.js'

let logger = new Logger()

export default function () {
    logger.logWithHeader('PRONTO', 'bgGreen', 'white', `S: ${this.guilds.size} | U: ${this.users.size} | MÉD: ${(this.users.size / this.guilds.size).toFixed(2)} | PID: ${process.pid}`)

    Structures.get('Message').prototype.send = async function (content, options) {
        if (this.response) {
            if (this.response.attachments.size)
                await this.response.delete()

            else if (this.collector)
                this.collector.stop()

            else
                return this.response.edit(content, options)
        }

        this.response = await this.channel.send(content, options)

        return this.response
    }
}
