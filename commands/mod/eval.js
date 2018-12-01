// eslint-disable-next-line no-unused-vars
import Discord from 'discord.js'
import util from 'util'

util.inspect.colors.light_blue = [94, 39]
util.inspect.colors.orange = ['38;5;214', 39]
util.inspect.styles = {
    name: 'orange',
    string: 'green',
    number: 'cyan',
    date: 'magenta',
    regexp: 'red',
    boolean: 'light_blue',
    null: 'bold',
    undefined: 'grey',
    special: 'cyan'
}

export const hidden = true
export const ownerOnly = true
export async function run (msg, suffix) {
    let code = suffix.replace(/^```(js|javascript ?\n)?|```$/g, '')
    let inspect  = (e, colors) => typeof e === 'string' ? e : util.inspect(e, { depth: 1, colors })
    let codeblock = arg => `\`\`\`js\n${arg}\n\`\`\``

    try {
        let result = async (temp) => {
            if (temp && temp[Symbol.toStringTag] === 'AsyncFunction')
                return result(await temp())
            if (temp && temp instanceof Promise)
                return result(await temp)

            return temp
        }

        let message = await result(eval(code))

        this.logger.debug(inspect(message, true).split('\n').length > 1
            ? '\n' + inspect(message, true)
            : inspect(message, true), 'EVAL')

        if (message && message.length > 2000)
            message = 'Mensagem muito longa, veja o console'

        msg.send(codeblock(inspect(message)))
    } catch (error) {
        this.logger.error(error)
        msg.send(codeblock(error)).catch(err => console.log(err.message))
    }
}
