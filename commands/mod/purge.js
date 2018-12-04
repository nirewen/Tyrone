import Filters from './purge.utils/filters'

export const desc = 'Deleta mensagens em massa de um canal'
export const help = [
    '```',
    '┌─────────────────────┬────────────────────────┐',
    '│ Filtros             │ Exemplos               │',
    '├─────────────────────┼────────────────────────┤',
    '│ text "texto"        │ ty@purge text "bolo"   │',
    '│ user @user | "user" │ ty@purge user @Nirewen │',
    '│ length num          │ ty@purge length 10     │',
    '│ invites             │ ty@purge 10 invites    │',
    '│ bots                │ ty@purge bots          │',
    '│ uploads             │ ty@purge 100 uploads   │',
    '│ links               │ ty@purge 5 links       │',
    '└─────────────────────┴────────────────────────┘',
    '```'
]
export const usage = '[limite][ ...filtros]'
export const requiredPermission = 'manageMessages'
export const cooldown = 5
export const guildOnly = true
export const aliases = ['prune', 'deletemsgs']
export async function run (msg, suffix = 50) {
    const parsed = Number(suffix)
    const limit = isNaN(suffix)
        ? 50
        : parsed

    const filters = Array.from(msg.flags, ([name, value]) => value ? { filter: Filters.find(filter => filter.name === name), value } : null)
    const messages = await msg.channel.messages.fetch({ limit, before: msg.id })
        .then(messages => messages.filter(
            message => filters.every(
                ({ filter, value }) => filter.check(message, value)
            )
        ))

    if (messages.size === 0)
        return msg.send(`Nenhuma mensagem que cumpre esses requisitos foi encontrada num raio de ${limit} mensagens`)

    const count = await msg.channel.bulkDelete(messages).then(message => message.size)

    return msg.send(`:wastebasket: Deletado ${count} mensage${count === 1 ? 'm' : 'ns'}`)
}
