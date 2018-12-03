import fs from 'fs'
import path from 'path'
import reload from 'require-reload'
import { MessageEmbed, Collection } from 'discord.js'

export class Command {
    constructor (name, category, cmd, bot) {
        this.name = name
        this.category = category
        this.bot = bot
        this.usage = cmd.usage || ''
        this.desc = cmd.desc
        this.help = cmd.help
        this.aliases = cmd.aliases || []
        this.cooldown = cmd.cooldown
        this.hidden = cmd.hidden || false
        this.ownerOnly = cmd.ownerOnly || false
        this.flags = cmd.flags || true
        this.subcommands = new Collection()
        this.run = cmd.run
        this.usersOnCooldown = new Set()

        this.fetchSubcommands()
    }

    get prefix () {
        return this.category.prefix
    }

    get fullName () {
        return this.parent ? `${this.parent.fullName} ${this.name}` : this.name
    }

    get correctUsage () {
        return `${this.prefix}${this.fullName} ${this.usage}`
    }

    get commandCooldown () {
        return this.cooldown > 60 ? (this.cooldown / 60) + ' minutos' : this.cooldown + ' segundos'
    }

    get helpMessage () {
        let embed = new MessageEmbed()
            .addField('Comando', `\`${this.correctUsage}\``, true)
            .setColor('ORANGE')

        if (this.desc)
            embed.addField('Descrição', this.desc)

        if (this.help)
            embed.addField('Ajuda', this.help)

        if (this.cooldown)
            embed.addField('Cooldown', this.commandCooldown, true)

        if (this.aliases.length > 0)
            embed.addField('Aliases', `${this.aliases.join(', ') || 'Nenhuma'}`, true)

        return embed
    }

    async process (msg, suffix) {
        console.log(require('util').inspect(this.bot, { depth: 0 }))

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

            if (this.find(sub))
                result = await this.find(sub).process(msg, args.join(' '))
            else
                result = await this.run(msg, suffix)
        } catch (err) {
            this.bot.logger.error(`${this.fullName} | ${err}\n${err.stack}`, 'ERRO DE EXECUÇÃO DE COMANDO')
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
        let { directory } = this.category
        try {
            let subcommands = fs.readdirSync(path.join(directory, `${this.name}.subcommands`))
            if (subcommands)
                for (let name of subcommands)
                    if (name.endsWith('.js') && !name.startsWith('-')) {
                        ([name] = name.split(/\.js$/))

                        let command = new Command(name, this.category, reload(path.join(directory, `${this.name}.subcommands`, name + '.js')), this.bot)

                        command.parent = this

                        this.subcommands.set(name, command)
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
