import fs from 'fs'
import reload from 'require-reload'
import { MessageEmbed, Collection } from 'discord.js'
import { Command } from './Command'
import { Logger } from './Logger'

export class Category {
    constructor (name, prefix, dir, color) {
        this.prefix = prefix
        this.name = name
        this.dir = dir
        this.color = color
        this.directory = `${__dirname}/../${dir}`
        this.commands = new Collection()
        this.logger = new Logger(color)
    }

    initialize (bot) {
        return new Promise((resolve, reject) => {
            fs.readdir(this.directory, (err, files) => {
                if (err) return this.logger.error(err)
                else if (!files) return this.logger.warn('Nenhum arquivo no diretório ' + this.dir)
                else {
                    for (let name of files) {
                        if (name.endsWith('.js') && !name.startsWith('-')) {
                            try {
                                name = name.split(/\.js$/)[0]
                                this.commands.set(name, new Command(name, this.prefix, reload(this.directory + name + '.js'), bot))
                                resolve(this)
                            } catch (e) {
                                reject(e)
                            }
                        } else
                            continue
                    }
                }
            })
        })
    }

    help (msg, command) {
        this.logger.logCommand(msg.guild ? msg.guild.name : null, msg.author.username, this.prefix + 'help', command)
        if (!command) {
            let comandos = this.commands.filter(c => !c.hidden).array()
            return new MessageEmbed()
                .setTitle(`Aqui tem uma lista dos comandos para o prefixo \`${this.prefix}\`:`)
                .setDescription(`\`${comandos.join('` `')}\``)
                .setFooter(`Para mais informações, digite ${this.prefix}help ‹comando›`)
                .setColor('#e67e22')
        } else {
            let cmd = this.find(command)
            if (!cmd) {
                return new MessageEmbed()
                    .setDescription(`:interrobang: Comando \`${this.prefix}${command}\` não encontrado`)
                    .setColor('RED')
            } else
                return cmd.helpMessage
        }
    }

    process (msg) {
        let name = msg.content.split(/\s+/)[0].replace(new RegExp(this.prefix, 'i'), '')

        let suffix = msg.content.slice((this.prefix + name).length).trim()

        let command = this.find(name)

        if (name === 'help')
            return msg.send(this.help(msg, suffix))

        if (command) {
            let cleanSuffix = msg.cleanContent.slice((this.prefix + name).length).trim()

            this.logger.logCommand(msg.guild ? msg.guild.name : null, msg.author.username, this.prefix + command.name, cleanSuffix)
            command.process(msg, suffix)
        }
    }

    find (name) {
        return this.commands.find(c => c.name === name || c.aliases.includes(name))
    }
}
