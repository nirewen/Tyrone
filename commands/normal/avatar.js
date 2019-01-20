import { CanvasUtils } from '../../utils/CanvasUtils'
import { MessageEmbed, MessageAttachment } from 'discord.js'
import * as utils from '../../utils/utils'

const WHITE = '#FFFFFF'

export const desc = 'Mostra o seu avatar ou o de @alguém'
export const aliases = ['foto', 'icon', 'pic', 'a']
export const usage = '[[@]usuario] | --server'
export const flags = true
export function run (msg, suffix) {
    let build = async function (member, bool) {
        let embed = new MessageEmbed()

        if (msg.flags.has('server')) {
            embed
                .setDescription(`:frame_photo: Aqui o ícone do servidor:`)
                .setImage(msg.guild.icon == null || msg.flags.has('default') ? `https://guild-default-icon.herokuapp.com/${msg.guild.nameAcronym}` : msg.guild.iconURL({ size: 2048 }))
                .setColor(msg.guild.owner.displayColor)

            return embed
        }
        if (bool) {
            let userMember = utils.findMember(member, msg.guild)
            if (/\d{16,18}/.test(member)) {
                try {
                    userMember = await utils.findUser(msg.guild, member)
                }
                catch (e) {
                    userMember = null
                }
            }
            if (userMember == null)
                return embed
                    .setDescription('Usuário não encontrado, tente novamente')
                    .setColor('RED')
            else
                return build(userMember, false) // chamar a function de novo com o membro achado
        }

        let user = member.user || member

        return embed
            .setDescription(`:frame_photo: Aqui o avatar de **${user.username}**:`)
            .setImage(msg.flags.has('default') ? user.defaultAvatarURL : user.displayAvatarURL({ size: 2048 }))
            .setColor(member.displayColor && member.displayColor > 0 ? member.displayColor : WHITE)
    }

    if ((msg.guild && suffix) || (msg.guild && msg.flags.has('server'))) {
        if (msg.mentions.members.first()) {
            return build(msg.mentions.members.first(), false)
                .then(embed => msg.send(embed))
        }
        else {
            return build(suffix, true)
                .then(embed => msg.send(embed))
        }
    }
    else {
        let sideColor = WHITE

        if (msg.guild)
            sideColor = msg.member.displayColor > 0 ? msg.member.displayColor : WHITE

        // mention em DM
        if (msg.mentions.users.first() && msg.mentions.users.first().id !== msg.author.id)
            msg.author = msg.mentions.users.first()

        return msg.send(new MessageEmbed()
            .setDescription(`:frame_photo: Aqui seu avatar, **${msg.author.username}**:`)
            .setImage(msg.flags.has('default') ? msg.author.defaultAvatarURL : msg.author.displayAvatarURL({ size: 2048 }))
            .setColor(sideColor))
    }
}
