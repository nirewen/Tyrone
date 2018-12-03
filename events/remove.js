import reload from 'require-reload'
import { Command } from '../structures/Command'
import { join } from 'path'

export async function run (path) {
    let [folder, ...subfolders] = path

    if (folder === 'commands') {
        let [category, name, subcommand] = subfolders.map(c => c.split('.')[0])

        category = this.categories.find(c => path.join('/').startsWith(c.dir))

        if (category.commands.has(name))
            if (subcommand)
                category.commands.set(name, new Command(name, category.prefix, reload(join('..', folder, category, name + 'js')), category, this))
            else
                category.commands.delete(name)
        else return
    }

    if (folder === 'events') {
        let [name] = subfolders.map(e => e.split('.')[0])

        delete this.events[name]
    }

    if (folder === 'config.json')
        this.config = {}

    this.logger.error(path.join('/'), 'DELETE')
}
