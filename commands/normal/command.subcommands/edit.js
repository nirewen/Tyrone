import TatsuScript from '../../../structures/interpreter/TatsuScript'

export const desc = 'Edite um comando customizado seu'
export const usage = '<nome> <script>'
export const guildOnly = true
export const aliases = ['update']
export async function run (msg, suffix) {
    if (!suffix)
        return 'wrong usage'
        
    const commands = await this.bot.database.get(`guilds/${msg.guild.id}/commands`)
    let [name, ...script] = suffix.split(' ')

    if (!commands.hasChild(name))
        return msg.send('Esse comando não existe nesse servidor. Você pode usar `ty!cmd list` para ver a lista')

    let command = await commands.ref.child(name).once('value')
    let val = command.val()

    if (val.author.id !== msg.author.id)
        return msg.send('Esse comando não é seu')

    command.ref.update({
        script: script.join(' ')
    })

    msg.command = { name }

    let { prefix } = TatsuScript.run(script, msg)

    msg.send(`Comando \`${prefix}${name}\` atualizado com sucesso`)
}
