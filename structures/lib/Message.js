import { MessageEmbed } from 'discord.js'

const getMatches = (string, regex) => {
    var matches = []
    var match
    while (match = regex.exec(string)) {
        matches.push([match[1], match[2]])
    }
    return matches
}

export const Message = DiscordMessage => {
    class Message extends DiscordMessage {
        async send (content, options) {
            if (this.response) {
                if (this.response.attachments.size) {
                    await this.response.delete()
                    delete this.response
                    return this.send(content, options)
                }

                if (this.collector)
                    this.collector.stop()

                if (this.embeds.length > 0 && !(content instanceof MessageEmbed))
                    content = { content, embed: null }

                return this.response.edit(content, options)
            }

            this.response = await this.channel.send(content, options)

            return this.response
        }

        get flags () {
            let flags = new Map()

            Object.defineProperty(flags, 'regex', {
                get: () => /--(\w+)\s??(.+?(?=--|$))?/g,
                enumerable: false
            })

            getMatches(this.content, flags.regex).forEach(k =>
                flags.set(k[0], k[1] && k[1].trim())
            )

            return flags
        }
    }

    return Message
}
