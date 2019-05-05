export const desc = 'Mostra o código de um comando customizado'
export const usage = '<comando>'
export const guildOnly = true
export const aliases = ['code']
export async function run (msg, name) {
    if (!name)
        return 'wrong usage'

    let command = await this.bot.database.get(`guilds/${msg.guild.id}/commands/${name}`).then(d => d.val())

    if (!command)
        return msg.send('Esse comando não existe nesse servidor. Você pode usar `ty!cmd list` para ver a lista')

    msg.send(command.script, {
        code: true
    })
}
