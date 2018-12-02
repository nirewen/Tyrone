export async function run (path) {
    let [folder] = path

    if (folder === 'commands') {
        let [category, name] = path.slice(1).map(c => c.split('.')[0])

        category = this.categories.find(c => path.join('/').startsWith(c.dir))

        if (category.commands.has(name))
            category.commands.delete(name)
        else return
    }

    if (folder === 'events') {
        let [name] = path.slice(1).map(e => e.split('.')[0])

        delete this.events[name]
    }

    if (folder === 'config.json')
        this.config = {}

    this.logger.error(path.join('/'), 'DELETE')
}
