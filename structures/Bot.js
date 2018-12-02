import fs from 'fs'
import reload from 'require-reload'
import config from '../config.json'
import { Client, Collection, Structures } from 'discord.js'
import { Category } from './Category'
import * as DiscordStructures from './lib'
import { Event } from './Event'
import { Firebase } from '../database/Firebase'
import { GameManager } from './GameManager'
import { Logger } from './Logger'
import { credentials as serviceAccount } from '../firebase-credentials'
import { TOKEN, OWNER_ID, FIREBASE_URL as databaseURL } from '@env'

export class Bot extends Client {
    constructor (clientOptions) {
        super(clientOptions)

        this.token = TOKEN
        this.logger = new Logger()
        this.database = new Firebase({ serviceAccount, databaseURL })
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
                        let { run } = reload(`../events/${file}`)

                        this.events.set(name, new Event(name, run))

                        this.on(name, function () {
                            this.events.get(name).run.call(this, ...arguments)
                            this.events.get(name).ran++
                        })
                        resolve()
                    } catch (e) {
                        reject(e)
                    }
                }
            })
        })
    }

    loadCommandSets (Category) {
        return new Promise(resolve => {
            for (let prefix in this.config.commandSets) {
                let { name, dir, color } = this.config.commandSets[prefix]
                this.categories.set(name.toLowerCase(), new Category(name, prefix, dir, color))
            }
            resolve()
        })
    }

    loadStructures () {
        return new Promise(resolve => {
            for (let [name, structure] of Object.entries(DiscordStructures))
                Structures.extend(name, structure)

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
            await this.loadCommandSets(Category)
            await this.initCategories()
            await this.loadEvents()
            await this.loadStructures()
            this.login(this.token)
        } catch (e) {
            this.logger.error(e, 'START ERROR')
        }
    }
}
