import reload from 'require-reload'
import { join } from 'path'
import { Command } from '../structures/Command'

export async function run (path) {
    let [folder, ...subfolders] = path

    if (folder === 'commands') {
        let [category, name] = subfolders.map(c => c.split('.')[0])

        category = this.categories.find(c => path.join('/').startsWith(c.dir))

        let command = reload(join('..', category.dir, name + '.js'))

        if (category.commands.has(name) && command.run)
            category.commands.set(name, new Command(name, category, command, this))
        else return
    }

    if (folder === 'events') {
        let [name] = subfolders.map(e => e.split('.')[0])

        let Event = reload(join('..', ...path))

        if (Event.run)
            this.events.set(name, Event)
        else return
    }

    if (folder === 'config.json')
        this.config = reload(join('..', ...path))

    if (folder === 'structures') {
        let [structure] = subfolders.map(s => s.split('.')[0])

        if (structure === 'Category') {
            let { Category } = reload(join('..', ...path))

            if (Category.constructor) {
                this.loadCommandSets(Category)
                this.initCategories()
            } else return
        }

        if (structure === 'Logger') {
            let { Logger } = reload(join('..', ...path))

            if (Logger.constructor) {
                this.logger = new Logger()
                this.categories.each(c => {
                    c.logger = new Logger(c.color)
                })
            } else return
        }
    }

    this.logger.debug(path.join('/'), 'RELOAD')
}
