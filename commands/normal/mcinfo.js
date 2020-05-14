import moment from 'moment'
import request from 'request-promise-native'
import * as util from './minecraft.utils/utils'
import { MessageEmbed, Util } from 'discord.js'
import { Visage } from '../../api/Visage'
import { NameMC } from '../../api/NameMC'

const MINECRAFT = 'https://minecraft.net/en-us/profile/skin/remote'

export const desc = 'Mostra as informações de um usuário Minecraft'
export const usage = '<username>'
export const aliases = ['mci']
export async function run (msg, suffix) {
    if (!suffix)
        return 'wrong usage'

    let [username] = suffix.split(' ')

    if (!util.validateUsername(username))
        return msg.send('Nome do usuário inválido (somente A-Z, a-z, 0-9 e _ de 3-32 caracteres)')

    let mojang = await request({ url: `https://api.mojang.com/users/profiles/minecraft/${username}`, json: true })

    if (!mojang) {
        let users = await NameMC.search(username)

        if (users.length > 0) {
            let embed = new MessageEmbed()
                .setTitle('Usuário não encontrado')
                .setDescription('Você quis dizer um desses?')
                .setFooter('Use as reactions para escolher')
                .setColor('BLUE')

            for (let [i, user] of users.entries())
                embed.addField(i + 1 + '\u20E3 ' + user.name, user.nicknames.map(n => Util.escapeMarkdown(n.username)), true)

            let message = await msg.send(embed)

            for (let [i] of users.entries())
                await message.react(i + 1 + '\u20E3')

            try {
                let reactions = await message.awaitReactions((r, u) => r.me && u.id === msg.author.id, { max: 1, time: 15E3, errors: ['time'] })
                let n = parseInt(reactions.first().emoji.name)

                mojang = { id: users[n - 1].uuid }
                message.reactions.removeAll()
            } catch (e) {
                return message.delete()
            }
        } else
            return msg.send(new MessageEmbed()
                .setDescription('Usuário não encontrado')
                .setColor('RED'))
    }

    let { id } = mojang
    let nicknames = await NameMC.getNicknames(id)
    let embed = new MessageEmbed()
        .setAuthor(await NameMC.getName(id), Visage.avatar(id))
        .setThumbnail(Visage.avatar(id))
        .setImage(Visage.full(id))
        .addField('Nickname', await NameMC.getName(id), true)
        .addField('UUID', id, true)
        .setColor('BLUE')

    if (nicknames.length > 0) {
        embed.addField('Histórico de nomes', nicknames.map(n => Util.escapeMarkdown(n.username)), true)
        if (nicknames.filter(n => n.date).length > 0)
            embed.addField('\u200b', nicknames.map(n => n.date && moment(n.date).format('DD/MM/YYYY [-] HH:mm')), true)
    }

    embed.addField('Skin', `[Baixar](${Visage.skin(id)} "Clique para baixar a skin") | [Aplicar](${MINECRAFT}?url=${Visage.skin(id)} "Clique para aplicar a skin à sua conta")`)

    msg.send(embed)
}
