import fs from 'fs';
import {Command} from './Command';
import {Logger} from './Logger';

export class Category {
    constructor(name, prefix, dir, color) {
        this.prefix = prefix;
        this.name = name;
        this.dir = dir;
        this.directory = `${__dirname}/../${dir}`;
        this.commands = {};
        this.logger = new Logger(color);
    }

    initialize(bot) {
        return new Promise((resolve, reject) => {
            fs.readdir(this.directory, (err, files) => {
                if (err) reject(err);
                else if (!files) reject('Nenhum arquivo no diretório ' + this.dir);
                else {
                    for (let name of files) {
                        if (name.endsWith('.js') && !name.startsWith('-')) {
                            try {
                                name = name.split(/\.js$/)[0];
                                this.commands[name] = new Command(name, this.prefix, require(this.directory + name + '.js'), bot);
                                resolve();
                            } catch (e) {
                                console.error(e);
                            }
                        } else
                            continue;
                    }
                }
            });
        });
    }

    process(msg) {
        let name = msg.content.split(/\s+/)[0].replace(new RegExp(this.prefix, 'i'), '');
        let command = this.find(name);
        if (command) {
            let suffix = msg.content.replace(new RegExp(this.prefix + name, 'i'), '').trim(),
                cleanSuffix = msg.cleanContent.replace(new RegExp(escape(this.prefix) + name, 'i'), '').trim();
            
            this.logger.logCommand(msg.guild ? msg.guild.name : null, msg.author.username, this.prefix + command.name, cleanSuffix);
            command.run(msg, suffix);
        }
    }

    find(name) {
        for (let command in this.commands) {
            if (name == command || this.commands[command].aliases.includes(name))
                return this.commands[command];
        }

        return null;
    }
}