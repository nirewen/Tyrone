import fs from 'fs'
import config from '../config.json'
import { Client } from 'discord.js'
import { Category } from './Category'
import { Logger } from './Logger'
import { TOKEN, OWNER_ID } from '@env'

export class Bot extends Client {
    constructor (clientOptions) {
        super(clientOptions)

        this.token = TOKEN
        this.logger = new Logger()
        this.categories = []
        this.ownerId = OWNER_ID
        this.config = config
    }

    initEvents () {
        return new Promise((resolve, reject) => {
            fs.readdirSync('./events').forEach(file => {
                if (file.endsWith('.js')) {
                    try {
                        let [name] = file.split(/\.js$/)
                        this.on(name, require(`../events/${file}`).default)
                        resolve()
                    } catch (e) {
                        reject(e)
                    }
                }
            })
        })
    };

    loadCommandSets () {
        return new Promise(resolve => {
            for (let prefix in this.config.commandSets) {
                let { name, dir, color } = this.config.commandSets[prefix]
                this.categories.push(new Category(name, prefix, dir, color))
            }
            resolve()
        })
    }

    initCategories (index = 0) {
        return new Promise((resolve, reject) => {
            this.categories[index].initialize(this)
                .then(() => {
                    this.logger.debug(`Carregado categoria ${this.categories[index].name}`, 'CATEG')
                    index++
                    if (this.categories.length > index) {
                        this.initCategories(index)
                            .then(resolve)
                            .catch(reject)
                    } else
                        resolve()
                }).catch(reject)
        })
    }

    async start () {
        try {
            await this.loadCommandSets()
            await this.initCategories()
            await this.initEvents()
            this.login(this.token).catch(error => {
                this.logger.error(error, 'LOGIN ERROR')
            })
        } catch (e) {
            this.logger.error(e, 'START ERROR')
        }
    }
}
