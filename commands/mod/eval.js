// eslint-disable-next-line no-unused-vars
import Discord from 'discord.js'
import util from 'util'

export const hidden = true
export const ownerOnly = true
export async function run (msg, suffix) {
    let code = suffix.replace(/^```(js|javascript ?\n)?|```$/g, '')

    let ins  = e => typeof e === 'string' ? e : util.inspect(e, { depth: 1 })

    let getEmbed = (arg, color) => `\`\`\`js\n${arg}\n\`\`\``

    try {
        let result = async (temp) => {
            if (temp && temp[Symbol.toStringTag] === 'AsyncFunction')
                return result(await temp())
            if (temp && temp instanceof Promise)
                return result(await temp)

            return temp
        }

        let message = ins(await result(eval(code)))

        this.logger.debug('\n' + message, 'EVAL')

        if (message.length > 2000)
            message = 'Mensagem muito longa, veja o console'

        msg.send(getEmbed(message, '#2ecc71'))
    } catch (error) {
        this.logger.error(error)
        msg.send(getEmbed(error, '#ff2626')).catch(err => console.log(err.message))
    }
}
