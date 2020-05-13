import moment from 'moment'
import human  from 'humanize-duration'
import * as utils from '../../utils/utils'
import { MessageEmbed, Util } from 'discord.js'

moment.locale('pt-br')

export const desc = 'Exibe um card de informações sobre alguém, se especificado'
export const help = 'Usando `ty!userinfo [@]usuario` você pode ver o card de alguém'
export const usage = '[[@]usuario]'
export const aliases = ['info', 'profile', 'ui']
export const guildOnly = true
export async function run (msg, suffix) {
    let findEmoji = name => this.bot.emojis.cache.find(e => e.guild.id === '199330631061078017' && e.name === name)
    let build = async (msg, user, bool = false) => {
        if (bool === true) {
            let userMember = utils.findMember(user, msg.guild)
            userMember = userMember ? userMember.user : null

            if (/\d{16,18}/.test(user)) {
                try {
                    userMember = await utils.findUser(msg.guild, user)
                } catch (e) {
                    userMember = null
                }
            }

            if (userMember == null) {
                return msg.send(new MessageEmbed()
                    .setDescription('Usuário não encontrado, tente novamente')
                    .setColor('RED')
                )
            }

            return build(msg, userMember.user || userMember, false)
        }

        let userMember      = msg.guild.member(user.id)
        let userName        = Util.escapeMarkdown(user.username)
        let userId          = user.id
        let userTag         = user.discriminator
        let userAvatar      = user.displayAvatarURL({ size: 2048 })
        let userCreatedAt   = new Date(user.createdAt)
        let userOwner       = msg.guild.owner.id === userId
        let dateFormat      = 'D [de] MMMM [de] YYYY, [às] HH:mm'
        let humanize = ms => human(Date.now() - ms, {
            language: 'pt',
            conjunction: ' e ',
            serialComma: false,
            round: true,
            units: ['y', 'mo', 'd', 'h', 'm']
        })

        let embed = new MessageEmbed()
            .setAuthor(`Informações de ${userName}`, userAvatar)
            .addField(`${findEmoji('discord')} Tag`, `${userName}#${userTag} ${userOwner ? findEmoji('dono') : ''}`, true)
            .addField(':snowflake: ID', userId, true)
            .addField(':star2: Criado', `${moment(userCreatedAt).format(dateFormat)}\n${humanize(userCreatedAt)} atrás`, true)
            .setThumbnail(userAvatar)
            .setColor(userMember ? userMember.displayColor : '#ffffff')

        if (userMember) {
            let userNickname = userMember.nickname ? Util.escapeMarkdown(userMember.nickname) : 'Nenhum'
            let userRolesLength = userMember && userMember.roles.cache.size
            let userRoles       = userRolesLength > 0 ? Util.discordSort(userMember.roles.cache) : null
            let userStatus      = userMember && userMember.presence.status
            let userJoinedAt    = userMember && (new Date(userMember.joinedAt))
            let gamesArr        = {
                PLAYING: `:video_game: Jogando`,
                STREAMING: `${findEmoji('streaming')} Transmitindo`,
                LISTENING: `:headphones: Ouvindo`,
                WATCHING: `:tv: Assistindo`
            }
            let userStatuses    = {
                streaming: `${findEmoji('streaming')} Transmitindo`,
                online   : `${findEmoji('online')} Disponível`,
                dnd      : `${findEmoji('dnd')} Ocupado`,
                idle     : `${findEmoji('idle')} Ausente`,
                offline  : `${findEmoji('offline')} Offline`
            }

            if (userMember.presence.activities.length && userMember.presence.activities.find(a => a.type === 'STREAMING'))
                userStatus = 'streaming'

            userStatus = userStatuses[userStatus]

            embed.spliceFields(1, 0, { name: ':label: Apelido', value: userNickname, inline: true })
            embed.spliceFields(3, 0, { name: ':eye_in_speech_bubble: Status', value: userStatus, inline: true })
            embed.spliceFields(5, 0, { name: ':inbox_tray: Entrou no servidor', value: `${moment(userJoinedAt).format(dateFormat)}\n${humanize(userJoinedAt)} atrás`, inline: true })
            embed.addField(`:briefcase: Cargos [${userRolesLength}]`, `${userRoles ? userRoles.map(r => r).slice(0, 15).join(', ') : 'Nenhum'}`)
            if (userMember.presence.activities.length) {
                userMember.presence.activities.sort((a, b) => {
                    if (a.type === b.type)
                        return 0
                    else if (a.type === 'LISTENING')
                        return 1
                    else if (b.type === 'LISTENING')
                        return -1
                })

                for (let activity of userMember.presence.activities) {
                    if (activity.type === 'LISTENING' && activity.state && activity.name === 'Spotify') {
                        embed.addField(gamesArr[activity.type], `${findEmoji('spotify')} **${activity.name}**`)
                        embed.setFooter(`${activity.state.replace(/;/g, ' &')} - ${activity.details}`, `https://i.scdn.co/image/${activity.assets.largeImage.split(':')[1]}`)
                    }
                    else if (activity.type === 'STREAMING' && activity.details) {
                        embed.addField(gamesArr[activity.type], `${findEmoji('twitch')} **[${activity.name}](${activity.url})**`)
                        embed.setFooter(`${activity.details}`, `https://static-cdn.jtvnw.net/previews-ttv/live_user_${activity.assets.largeImage.split(':')[1]}-60x60.jpg`)
                    } else
                        embed.addField(gamesArr[activity.type], activity.name)
                }
            }
        }
        return msg.send(embed)
    }

    if (msg.mentions.users.first())
        return build(msg, msg.mentions.users.first())

    if (!msg.mentions.users.first() && suffix)
        return build(msg, suffix, true)

    if (!suffix)
        return build(msg, msg.author)
}
