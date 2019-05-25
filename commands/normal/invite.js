import { MessageEmbed } from 'discord.js'

export const desc = 'Mostra o link de convite do bot'
export const aliases = ['convite']
export async function run (msg) {
    msg.send(
        new MessageEmbed()
            .setAuthor(
                `Link de convite do ${this.bot.user.username}`,
                this.bot.user.avatarURL({ size: 2048 })
            )
            .setDescription(
                `Para adicionar o ${
                    this.bot.user.username
                } ao seu servidor, [clique aqui](${this.bot.config.inviteLink})`
            )
            .setColor('ORANGE')
    )
}
