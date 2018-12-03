import fs from 'fs'
import path from 'path'
import reload from 'require-reload'
import { MessageEmbed, Collection } from 'discord.js'

export class Command {
    constructor (name, prefix, cmd, category, bot) {
        this.name = name
        this.prefix = prefix
        this.category = category
        this.bot = bot
        this.usage = cmd.usage || ''
        this.desc = cmd.desc || 'Sem descrição'
        this.details = cmd.help || this.desc
        this.aliases = cmd.aliases || []
        this.cooldown = cmd.cooldown || 0
        this.hidden = cmd.hidden || false
        this.ownerOnly = cmd.ownerOnly || false
        this.flags = cmd.flags || true
        this.subcommands = new Collection()
        this.run = cmd.run
        this.usersOnCooldown = new Set()

        this.fetchSubcommands()
    }

    get correctUsage () {
        return `${this.prefix}${this.name} ${this.usage}`
    }

    get commandCooldown () {
        return this.cooldown > 60 ? (this.cooldown / 60) + ' minutos' : this.cooldown + ' segundos'
    }

    get helpMessage () {
        return new MessageEmbed()
            .addField('Comando', `\`${this.correctUsage}\``, true)
            .addField('Detalhes', this.details)
            .addField('Descrição', this.desc)
            .addField('Cooldown', this.commandCooldown, true)
            .addField('Aliases', `${this.aliases.join(', ') || 'Nenhuma'}`, true)
            .setColor('#e67e22')
    }

    async process (msg, suffix) {
        if (msg.author.bot)
            return

        if (this.ownerOnly && !this.bot.config.admins.includes(msg.author.id))
            return msg.channel.send('Este comando é só para o dono do bot')
        if (!msg.guild && this.guildOnly)
            return msg.channel.send('Este comando só está disponível em servidores')

        if (this.flags)
            suffix = suffix.replace(msg.flags.regex, '').trim()

        let result
        try {
            let [sub, ...args] = suffix.split(/\s/)

            result = await (sub
                ? this.find(sub)
                    ? this.find(sub).process(msg, args.join(' '))
                    : 'wrong usage'
                : this.run(msg, suffix))
        } catch (err) {
            this.bot.logger.error(`${err}\n${err.stack}`, 'ERRO DE EXECUÇÃO DE COMANDO')

            if (this.bot.config.errorMessage) {
                try {
                    msg.channel.send(this.bot.config.errorMessage)
                } catch (e) {} // se der erro de perm cai no nada pq eu n quero dar handle nisso
            }
        }

        if (result === 'wrong usage') {
            let m = await msg.channel.send(new MessageEmbed()
                .setTitle(':interrobang: Uso incorreto')
                .setDescription(`Tente de novo:\n${this.correctUsage}`)
                .setColor('RED'))

            m.delete({ timeout: 3E3 })
        }
        else if (!this.bot.config.admins.includes(msg.author.id)) {
            this.usersOnCooldown.add(msg.author.id)
            setTimeout(() => {
                this.usersOnCooldown.delete(msg.author.id)
            }, this.cooldown * 1000)
        }

        msg.command = true
    }

    fetchSubcommands () {
        let { prefix, directory } = this.category
        try {
            let subcommands = fs.readdirSync(path.join(directory, `${this.name}.subcommands`))
            if (subcommands)
                for (let name of subcommands)
                    if (name.endsWith('.js') && !name.startsWith('-')) {
                        ([name] = name.split(/\.js$/))
                        this.subcommands.set(name, new Command(name, prefix, reload(path.join(directory, `${this.name}.subcommands`, name + '.js')), this.category, this.bot))
                    } else
                        continue
        } catch (e) {}
    }

    find (name) {
        return this.subcommands.find(c => c.name === name || c.aliases.includes(name))
    }

    get logger () {
        return this.bot.logger
    }
}
