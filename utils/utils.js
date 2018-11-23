/* eslint-disable no-mixed-operators */

import request from 'request-promise-native'

export async function osu (user, mode, color) {
    let url = `https://lemmmy.pw/osusig/sig.php?colour=${color}&uname=${user}&pp=1&darktriangles&mode=${mode}&xpbar&xpbarhex`

    return request({ url, encoding: null })
}

export function findRole (query, guild, exact = false) {
    let found = null
    if (query === undefined || guild === undefined)
        return found

    query = query.toLowerCase()
    guild.roles.each(r => { if (r.name.toLowerCase() === query) found = r })
    if (!found && !exact) guild.roles.each(r => { if (r.name.toLowerCase().indexOf(query) === 0) found = r })
    if (!found && !exact) guild.roles.each(r => { if (r.name.toLowerCase().includes(query)) found = r })
    return found
}

export function findMember (query, guild, exact = false) {
    let found = null
    if (query === undefined || guild === undefined)
        return found
    query = query.toLowerCase()
    guild.members.each(m => { if (m.user.username.toLowerCase() === query) found = m })
    if (!found) guild.members.each(m => { if (m.nickname && m.nickname.toLowerCase() === query) found = m })
    if (!found && !exact) guild.members.each(m => { if (m.user.username.toLowerCase().indexOf(query) === 0) found = m })
    if (!found && !exact) guild.members.each(m => { if (m.nickname && m.nickname.toLowerCase().indexOf(query) === 0) found = m })
    if (!found && !exact) guild.members.each(m => { if (m.user.username.toLowerCase().includes(query)) found = m })
    if (!found && !exact) guild.members.each(m => { if (m.nickname && m.nickname.toLowerCase().includes(query)) found = m })
    return found
}

export function findGuild (query, guilds, exact = false) {
    let found = null
    if (query === undefined || guilds === undefined)
        return found

    query = query.toLowerCase()
    guilds.each(g => { if (g.name.toLowerCase() === query) found = g })
    if (!found && !exact) guilds.each(g => { if (g.name.toLowerCase().indexOf(query) === 0) found = g })
    if (!found && !exact) guilds.each(g => { if (g.name.toLowerCase().includes(query)) found = g })
    return found
}

export function findUserInGuild (query, guild, exact = false) {
    let found = null
    if (query === undefined || guild === undefined)
        return found

    query = query.toLowerCase()
    guild.members.each(m => { if (m.user.username.toLowerCase() === query) found = m })
    if (!found) guild.members.each(m => { if (m.nickname && m.nickname.toLowerCase() === query) found = m })
    if (!found && !exact) guild.members.each(m => { if (m.user.username.toLowerCase().indexOf(query) === 0) found = m })
    if (!found && !exact) guild.members.each(m => { if (m.nickname && m.nickname.toLowerCase().indexOf(query) === 0) found = m })
    if (!found && !exact) guild.members.each(m => { if (m.user.username.toLowerCase().includes(query)) found = m })
    if (!found && !exact) guild.members.each(m => { if (m.nickname && m.nickname.toLowerCase().includes(query)) found = m })
    return found === null ? found : found.user
}

export async function findUser (guild, id) {
    if (guild.members.has(id)) {
        return guild.members.get(id)
    } else {
        let bot  = guild.client

        let user = await bot.users.fetch(id)
        return user
    }
}

export function getMentions (msg) {
    let mentionRegex = /<(?<type>@|#)(?<specific>&|!)?(?<id>[0-9]{16,18})>/g
    let mentions = msg.content.match(mentionRegex)

    if (!mentions)
        return null

    let finalMentions = {
        channels: [],
        members: [],
        roles: [],
        users: []
    }

    mentions
        .map(mention => {
            let { groups } = mentionRegex.exec(mention)
            mentionRegex.lastIndex = 0
            return groups
        })
        .forEach(async ({ type, specific, id }) => {
            if (type === '@') {
                if (specific === '&') {
                    let role = msg.guild.roles.has(id) && msg.guild.roles.get(id)
                    if (role)
                        return finalMentions.roles.push(role)
                }

                if (!specific || specific === '!') {
                    let member = msg.channel.guild.members.has(id) && msg.channel.guild.members.get(id)
                    let user = member.user

                    if (member) {
                        finalMentions.members.push(member)
                        finalMentions.users.push(user)
                    }
                }

                return
            }

            if (type === '#') {
                let channel = msg.channel.guild.channels.has(id) && msg.channel.guild.channels.get(id)
                if (channel)
                    return finalMentions.channels.push(channel)
            }
        })

    return finalMentions
}

export async function searchImage (msg, defaultToAvatar = true) {
    let regex = /(?:([^:/?#]+):)?(?:\/\/([^/?#]*))?([^?#]*\.(?:jpg|gif|png))(?:\?([^#]*))?(?:#(.*))?/
    let urlRegex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/

    if (msg.attachments.size > 0 && regex.test(msg.attachments.first().url) && msg.attachments.first().size > 128)
        return {
            file: await request({ url: msg.attachments.first().url, encoding: null }),
            name: msg.attachments.first().name
        }

    else if (msg.embeds.length > 0 && msg.embeds[0].image && regex.test(msg.embeds[0].image.url))
        return {
            file: await request({ url: msg.embeds[0].image.url, encoding: null }),
            name: msg.embeds[0].image.url.split('/').pop()
        }

    else if (/\b\d{16,18}\b/.test(msg.content)) {
        let user = await msg.client.users.fetch(msg.content.match(/\d{16,18}/)[0])
        if (user)
            return {
                file: await request({ url: user.displayAvatarURL({ format: 'png', size: 2048 }), encoding: null }),
                name: user.displayAvatarURL({ format: 'png', size: 2048 }).split('/').pop().split('?')[0]
            }
    }

    else if (regex.test(msg.content) && urlRegex.test(msg.content))
        return {
            file: await request({ url: msg.content.match(urlRegex)[0], encoding: null }),
            name: msg.content.match(urlRegex)[0].split('/').pop()
        }

    else if (msg.mentions.users.size > 0)
        return {
            file: await request({ url: msg.mentions.users.first().displayAvatarURL({ format: 'png', size: 2048 }), encoding: null }),
            name: (msg.mentions.users.first().displayAvatarURL({ format: 'png', size: 2048 })).split('/').pop().split('?')[0]
        }

    else {
        let messages = await msg.channel.messages.fetch({
            limit: 10,
            before: msg.id
        }).then(c => c.array())

        for (let message of messages)
            if (message.author.id !== msg.client.user.id && 
                (message.attachments.size > 0 && regex.test(message.attachments.first().url) && message.attachments.first().size > 128) || 
                (message.embeds.length > 0 &&
                message.embeds[0].image &&
                regex.test(message.embeds[0].image.url)))
                return searchImage(message, defaultToAvatar)

        if (defaultToAvatar)
            return {
                file: await request({ url: msg.author.displayAvatarURL({ format: 'png', size: 2048 }), encoding: null }),
                name: (msg.author.displayAvatarURL({ format: 'png', size: 2048 })).split('/').pop().split('?')[0]
            }
    }
}
