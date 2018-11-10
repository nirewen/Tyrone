import Discord from 'discord.js'
import util from 'util'

export const hidden = true
export const ownerOnly = true
export async function run (msg, suffix) {
    let code = suffix.replace(/^```(js|javascript ?\n)?|```$/g, '')

    let ins  = e => util.inspect(e, { depth: 0 })

    let getEmbed = (arg, color) => {
        return new Discord.RichEmbed()
            .setAuthor(msg.author.username + ' - Eval de código JavaScript', msg.author.avatarURL)
            .addField('resultado', `\`\`\`js\n${arg}\n\`\`\``)
            .setColor(color)
    }

    try {
        let result = async (temp) => {
            if (temp && temp[Symbol.toStringTag] === 'AsyncFunction')
                return result(await temp())
            if (temp && temp instanceof Promise)
                return result(await temp)

            return temp
        }

        let message = ins(await result(eval(code)))

        if (message.length > 2000)
            message = 'Mensagem muito longa, veja o console'

        msg.send(getEmbed(message, '#2ecc71'))
    } catch (error) {
        msg.send(getEmbed(error, '#ff2626')).catch(err => console.log(err.message))
    }
}
