import TatsuScript from '../../../structures/interpreter/TatsuScript'

export const desc = 'Crie comandos personalizados no Tyrone'
export const guildOnly = true
export const aliases = ['register', 'add']
export async function run (msg, suffix) {
    const commands = await this.bot.database.get(`guilds/${msg.guild.id}/commands`)
    const args = suffix.split(' ')

    let [name, ...script] = args

    if (commands.hasChild(args[0]))
        return msg.send('Um comando com esse nome já existe. Se esse comando for seu, use ty!command edit')

    if (!script)
        return msg.send('Você precisa especificar um script para o comando')

    msg.command = { name }

    let command = {
        author: {
            username: msg.author.username,
            id: msg.author.id
        },
        script: script.join(' '), 
        uses: 0
    }

    commands.ref.child(name).set(command)

    let { prefix } = TatsuScript.run(script.join(' '), msg)

    msg.send(`Comando ${prefix}${name} registrado nesse servidor!`)
}
