import TatsuScript from '../../../structures/interpreter/TatsuScript'

export const desc = 'Apaga comandos do servidor se eles forem seus'
export const usage = '<nome>'
export const guildOnly = true
export const aliases = ['remove']
export async function run (msg, name) {
    if (!name)
        return 'wrong usage'
        
    let commands = await this.bot.database.get(`guilds/${msg.guild.id}/commands`)

    if (!commands.hasChild(name))
        return msg.send('Esse comando não existe nesse servidor. Você pode usar `ty!cmd list` para ver a lista')

    let command = commands.ref.child(name)
    let { script, author: { id } } = await command.once('value').then(d => d.val())

    if (id !== msg.author.id)
        return msg.send('Esse comando não é seu')
    
    command.set(null)

    msg.command = { name }
    let { prefix } = TatsuScript.run(script, msg)

    msg.send(`Comando \`${prefix}${name}\` apagado do servidor`)
}