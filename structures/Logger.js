import chalk from 'chalk'
import Table from 'cli-table2'
import util from 'util'

export class Logger {
    constructor (commandColor) {
        this.commandColor = commandColor
    }

    set color (value) {
        this.commandColor = value
    }

    get timestamp () {
        return `[${new Date().toLocaleString('pt-BR')}] `
    }

    log (text, color) {
        return console.log(this.timestamp + (color ? chalk[color](text) : text))
    }

    logWithHeader (headerText, headerBackground, headerColor, text, color) {
        return console.log(this.timestamp + chalk[headerBackground][headerColor || 'white'](` ${headerText} `), (color ? chalk[color](text) : text))
    }

    logCommand (guildName, userName, commandName, suffix) {
        if (guildName)
            return console.log(this.timestamp + `${chalk.bold.magenta(guildName)} >> ${chalk.bold.green(userName)} > ${this.commandColor === undefined ? commandName : chalk.bold[this.commandColor](commandName)} ${suffix}`)
        return console.log(this.timestamp + `${chalk.bold.green(userName)} > ${this.commandColor === undefined ? commandName : chalk.bold[this.commandColor](commandName)} ${suffix}`)
    }

    warn (text, wText = 'AVISO') {
        return console.log(this.timestamp + `${chalk.bgYellow.white(` ${wText} `)} ${text}`)
    }

    error (text, eText = 'ERRO') {
        return console.log(this.timestamp + `${chalk.bgRed.white(` ${eText} `)} ${text}`)
    }

    debug (text, dText = 'DEBUG') {
        return console.log(this.timestamp + `${chalk.bgBlue.white(` ${dText} `)} ${text}`)
    }

    table (array) {
        let table = new Table({ style: { head: [], border: [] } })
        let head = []

        array.forEach((element, index) => {
            let val = []

            if (element instanceof Array)
                for (let i in element) {
                    if (head.indexOf(i) === -1)
                        head.push(i)

                    let ti = i

                    if (i >= head.indexOf('Values') &&
                        head.indexOf('Values') !== -1)
                        ti++

                    val[ti] = element[i]
                }
            else {
                if (head.indexOf('Values') === -1)
                    head.push('Values')

                val[head.indexOf('Values')] = element
            }

            table.push([index, ...val])
        })

        head.unshift('')
        table.options.head = head

        console.log(table.toString())

        return table.toString()
    }
}
