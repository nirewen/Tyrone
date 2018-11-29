import fs from 'fs'
import reload from 'require-reload'
import config from '../config.json'
import { Client, Collection } from 'discord.js'
import { Category } from './Category'
import { GameManager } from './GameManager'
import { Logger } from './Logger'
import { TOKEN, OWNER_ID } from '@env'

export class Bot extends Client {
    constructor (clientOptions) {
        super(clientOptions)

        this.token = TOKEN
        this.logger = new Logger()
        this.categories = new Collection()
        this.events = new Collection()
        this.games = new GameManager(...fs.readdirSync('./commands/games').map(c => c.substr(0, c.indexOf('.js'))))
        this.ownerId = OWNER_ID
        this.config = config
    }

    loadEvents () {
        return new Promise((resolve, reject) => {
            fs.readdirSync('./events').forEach(file => {
                if (file.endsWith('.js')) {
                    try {
                        let [name] = file.split(/\.js$/)
                        let { default: Event } = reload(`../events/${file}`)

                        this.events.set(name, new Event(name))

                        this.on(name, function () {
                            this.events.get(name).run.call(this, ...arguments)
                            this.events.get(name).runtime++
                        })
                        resolve()
                    } catch (e) {
                        reject(e)
                    }
                }
            })
        })
    }

    loadCommandSets () {
        return new Promise(resolve => {
            for (let prefix in this.config.commandSets) {
                let { name, dir, color } = this.config.commandSets[prefix]
                this.categories.set(name, new Category(name, prefix, dir, color))
            }
            resolve()
        })
    }

    initCategories (index = 0) {
        return new Promise((resolve, reject) => {
            this.categories.array()[index].initialize(this)
                .then(c => {
                    this.logger.debug(`Carregado categoria ${c.name}`, 'CATEG')
                    index++
                    if (this.categories.size > index) {
                        this.initCategories(index)
                            .then(resolve)
                            .catch(reject)
                    } else
                        resolve()
                }).catch(reject)
        })
    }

    login (token) {
        this.logger.logBold('Logando...', 'green')
        
        super.login(token).catch(error => {
            this.logger.error(error, 'LOGIN ERROR')
        })
    }

    async start () {
        try {
            await this.loadCommandSets()
            await this.initCategories()
            await this.loadEvents()
            this.login(this.token)
        } catch (e) {
            this.logger.error(e, 'START ERROR')
        }
    }
}
