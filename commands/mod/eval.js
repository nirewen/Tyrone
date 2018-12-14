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
    let code = suffix.replace(/^\u0060\u0060\u0060(js|javascript ?\n)?|\u0060\u0060\u0060$/g, '')
    let inspect  = (e, colors) => typeof e === 'string' ? e : util.inspect(e, { depth: 0, colors })
    let codeblock = arg => `\u0060\u0060\u0060js\n${arg}\n\u0060\u0060\u0060`

    try {
        let awaitResult = async (temp) => {
            if (temp && temp[Symbol.toStringTag] === 'AsyncFunction')
                return awaitResult(await temp())
            if (temp && temp instanceof Promise)
                return awaitResult(await temp)

            return temp
        }

        let result = eval(code)
        let type = result.constructor.name
        let message = await awaitResult(result)
        let logMessage = `[${type}] => ${inspect(message, true)}`

        this.logger.debug(logMessage.split('\n').length > 1
            ? '\n' + logMessage
            : logMessage, 'EVAL')

        if (message && message.length > 2000)
            message = 'Mensagem muito longa, veja o console'
        else
            message = `[${type}] => ${inspect(message)}`

        msg.send(codeblock(message))
    } catch (error) {
        this.logger.error(error)
        msg.send(codeblock(error)).catch(err => console.log(err.message))
    }
}
