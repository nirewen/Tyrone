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
        let head = []

        array.forEach((e) => {
            if (e instanceof Array)
                e.forEach((_e, i) => {
                    if (head.indexOf(i) === -1)
                        head.push(i)
                })
            else if (head.indexOf('Values') === -1)
                head.push('Values')
        })

        let table = new Table({
            style: { head: [], border: [] },
            head
        })

        array.forEach((e, i) => {
            let val = []

            if (e instanceof Array)
                for (let ix = 0; ix < e.length; ix++) {
                    let tempi = ix

                    if (ix >= head.indexOf('Values') && head.indexOf('Values') !== -1)
                        tempi++

                    val[tempi] = `${e[ix]}`
                }
            else
                val[head.indexOf('Values')] = `${e}`

            table.push([i, ...val])
        })

        table.options.head.unshift('')

        console.log(table.toString())

        return table.toString()
    }
}
