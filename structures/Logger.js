import chalk from 'chalk'

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
}
