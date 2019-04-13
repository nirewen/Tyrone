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
    let findEmoji = name => this.bot.emojis.find(e => e.guild.id === '199330631061078017' && e.name === name)
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
            let userRolesLength = userMember && userMember.roles.size
            let userRoles       = userRolesLength > 0 ? Util.discordSort(userMember.roles) : null
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

            if (userMember.presence.activity && userMember.presence.activity.type && userMember.presence.activity.type === 1)
                userStatus = 'streaming'

            userStatus = userStatuses[userStatus]

            embed.spliceField(1, 0, ':label: Apelido', userNickname, true)
            embed.spliceField(3, 0, ':eye_in_speech_bubble: Status', userStatus, true)
            embed.spliceField(5, 0, ':inbox_tray: Entrou no servidor', `${moment(userJoinedAt).format(dateFormat)}\n${humanize(userJoinedAt)} atrás`, true)
            embed.addField(`:briefcase: Cargos [${userRolesLength}]`, `${userRoles ? userRoles.map(r => r).slice(0, 15).join(', ') : 'Nenhum'}`)
            if (userMember.presence.activity) {
                if (userMember.presence.activity.type === 'LISTENING' && userMember.presence.activity.state && userMember.presence.activity.name === 'Spotify') {
                    embed.addField(gamesArr[userMember.presence.activity.type], `${findEmoji('spotify')} **${userMember.presence.activity.name}**`)
                    embed.setFooter(`${userMember.presence.activity.state.replace(/;/g, ' &')} - ${userMember.presence.activity.details}`, `https://i.scdn.co/image/${userMember.presence.activity.assets.largeImage.split(':')[1]}`)
                }
                else if (userMember.presence.activity.type === 'STREAMING' && userMember.presence.activity.details) {
                    embed.addField(gamesArr[userMember.presence.activity.type], `${findEmoji('twitch')} **[${userMember.presence.activity.name}](${userMember.presence.activity.url})**`)
                    embed.setFooter(`${userMember.presence.activity.details}`, `https://static-cdn.jtvnw.net/previews-ttv/live_user_${userMember.presence.activity.assets.largeImage.split(':')[1]}-60x60.jpg`)
                } else
                    embed.addField(gamesArr[userMember.presence.activity.type], userMember.presence.activity.name)
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
