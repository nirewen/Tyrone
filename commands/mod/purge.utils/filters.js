class Filter {
    constructor (name, check) {
        this.name = name
        this.check = check
    }
}

const regexes = {
    id: /(\d{17,19})/g,
    invite: /\bhttps?:\/\/discord.gg\/(invite)?\[a-z-A-Z-0-9]+?\b/g,
    url: /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_+.~#?&//=]*)/
}

export default [
    new Filter('text',    (msg, text) => msg.content.includes(text)),
    new Filter('user',    (msg, id) =>   id.match(regexes.id) !== null && msg.author.id === id.match(regexes.id)[0]),
    new Filter('length',  (msg, n) =>    msg.content.length === Number(n)),
    new Filter('invites', (msg) =>       msg.content.match(regexes.invite) !== null),
    new Filter('bots',    (msg) =>       msg.author.bot),
    new Filter('uploads', (msg) =>       msg.attachments.size > 0),
    new Filter('links',   (msg) =>       msg.content.match(regexes.url) !== null)
]
