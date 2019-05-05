import fs from 'fs'
import path from 'path'
import reload from 'require-reload'
import TatsuScript from './interpreter/TatsuScript'
import { MessageEmbed, Collection } from 'discord.js'
import { Command } from './Command'
import { CustomCommand } from './CustomCommand'
import { Logger } from './Logger'
import { escapeRegex } from '../utils/utils'

export class Category {
    constructor (name, prefix, dir, color) {
        this.prefix = prefix
        this.name = name
        this.dir = dir
        this.color = color
        this.directory = path.join(__dirname, '..', dir)
        this.commands = new Collection()
        this.logger = new Logger(color)
    }

    initialize (bot) {
        this.bot = bot

        return new Promise((resolve, reject) => {
            try {
                let files = fs.readdirSync(this.directory)
                if (!files)
                    return this.logger.warn('Nenhum arquivo no diretório ' + this.dir)

                for (let name of files)
                    if (name.endsWith('.js') && !name.startsWith('-')) {
                        ([name] = name.split(/\.js$/))

                        this.commands.set(name, new Command(name, this, reload(path.join(this.directory, name + '.js')), bot))
                    } else
                        continue
                resolve(this)
            } catch (e) {
                reject(e)
            }
        })
    }

    async help (collection, msg, ...suffix) {
        let [command, ...subcommands] = suffix

        if (!command) {
            let comandos = this.commands.filter(c => !c.hidden).map(c => c.name)

            return new MessageEmbed()
                .setTitle(`Aqui tem uma lista dos comandos para o prefixo \`${this.prefix}\`:`)
                .setDescription(`\`${comandos.join('` `')}\``)
                .setFooter(`Para mais informações, digite ${this.prefix}help ‹comando›`)
                .setColor('ORANGE')
        } else {
            let cmd = collection.find(command) || await this.findCustomCommand(msg, command)

            if (!cmd) {
                return new MessageEmbed()
                    .setDescription(`:interrobang: Comando \`${this.prefix}${command}\` não encontrado`)
                    .setColor('RED')
            }

            if (subcommands.length > 0 && cmd instanceof Command)
                return this.help(cmd, msg, ...subcommands)

            this.logger.logCommand(msg.guild ? msg.guild.name : null, msg.author.username, this.prefix + 'help', cmd.fullName)

            return cmd.helpMessage
        }
    }

    async process (msg) {
        let name = msg.content.split(/\s+/)[0].replace(new RegExp(escapeRegex(this.prefix), 'i'), '').toLowerCase()
        let suffix = msg.content.slice((this.prefix + name).length).trim()
        let command = this.find(name) || await this.findCustomCommand(msg, name)

        if (name === 'help')
            return msg.send(await this.help(this, msg, ...suffix.toLowerCase().split(/\s/)))

        if (command)
            command.process(msg, suffix)
    }

    async findCustomCommand (msg, cmd) {
        let snap = await this.bot.database.get(`guilds/${msg.guild.id}/commands`)
        let value = snap.val()

        if (!value)
            return

        let commands = Object.entries(value).map(([name, command]) => {
            msg.command = { name }

            return new CustomCommand(name, this, TatsuScript.run(command.script, msg), this.bot, snap)
        })

        return commands.find(c => c.name === cmd || c.aliases.includes(cmd))
    }

    find (name) {
        return this.commands.find(c => c.name === name || c.aliases.includes(name))
    }
}
