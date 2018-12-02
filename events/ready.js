import { Structures, MessageEmbed } from 'discord.js'

export async function run () {
    let { users: { size: users }, guilds: { size: guilds } } = this
    
    this.logger.logWithHeader('PRONTO', 'bgGreen', 'white', `S: ${guilds} | U: ${users} | MÉD: ${(users / guilds).toFixed(2)} | PID: ${process.pid}`)

    Structures.get('Message').prototype.send = async function (content, options) {
        if (this.response) {
            if (this.response.attachments.size) {
                await this.response.delete()
                return this.send(content, options)
            }

            if (this.collector)
                this.collector.stop()

            if (!(content instanceof MessageEmbed))
                content = { content, embed: null }

            return this.response.edit(content, options)
        }

        this.response = await this.channel.send(content, options)

        return this.response
    }
}
