import reload from 'require-reload'
import { Command } from '../structures/Command'

export async function run (path) {
    let [folder] = path

    if (folder === 'commands') {
        let [category, name] = path.slice(1).map(c => c.split('.')[0])

        category = this.categories.find(c => path.join('/').startsWith(c.dir))

        let command = reload(['..', ...path].join('/'))

        if (category.commands.has(name) && command.run)
            category.commands.set(name, new Command(name, category.prefix, command, this))
        else return
    }

    if (folder === 'events') {
        let [name] = path.slice(1).map(e => e.split('.')[0])

        let { default: Event } = reload(['..', ...path].join('/'))

        if (Event)
            this.events.set(name, new Event(name))
        else return
    }

    if (folder === 'config.json')
        this.config = reload(['..', ...path].join('/'))

    if (folder === 'structures') {
        let [structure] = path.slice(1).map(s => s.split('.')[0])

        if (structure === 'Category') {
            let { Category } = reload(['..', ...path].join('/'))

            this.loadCommandSets(Category)
            this.initCategories()
        }

        if (structure === 'Logger') {
            let { Logger } = reload(['..', ...path].join('/'))

            this.logger = new Logger()
            this.categories.each(c => {
                c.logger = new Logger(c.color)
            })
        }
    }

    this.logger.debug(path.join('/'), 'RELOAD')
}
