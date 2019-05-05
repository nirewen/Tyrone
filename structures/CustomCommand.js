import TatsuScript from './interpreter/TatsuScript'
import { Command } from './Command'
import { Util } from 'discord.js'

export class CustomCommand extends Command {
    constructor (name, category, cmd, bot, snap) {
        super(name, category, cmd, bot)
        
        this.script = cmd.script
        this.author = cmd.author
        this.uses = cmd.uses
        this.cmd = cmd
        this.snap = snap
    }

    get helpMessage () {
        return super.helpMessage
            .addField('Autor', this.author.username, true)
            .addField('Usos', this.uses, true)
    }

    process (msg, suffix) {
        if (msg.author.bot || !(this.cmd.prefix === this.prefix && this.bot.prefixes.includes(this.cmd.prefix)))
            return

        try {
            this.category.logger.logCommand(msg.guild ? msg.guild.name : null, msg.author.username, this.prefix + this.fullName, Util.cleanContent(suffix, msg))

            let uses = this.snap.child(this.name + '/uses')

            uses.ref.set(uses.val() + 1)

            msg.send(this.cmd)
        } catch (err) {
            this.bot.logger.error(`${this.fullName} | ${err}\n${err.stack}`, 'ERRO DE EXECUÇÃO DE COMANDO')
            if (this.bot.config.errorMessage) {
                try {
                    msg.channel.send(this.bot.config.errorMessage)
                } catch (e) {}
            }
        }
    }
}