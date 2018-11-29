import chokidar from 'chokidar'
import { Bot } from './structures/Bot'

const client = new Bot()
const watcher = chokidar.watch([
    './commands',
    './events',
    './games',
    './structures',
    './config.json'
])

client.start().then(() => {
    watcher.on('change', (path) => client.emit('reload', path.split(/\\|\//)))
    watcher.on('unlink', (path) => client.emit('remove', path.split(/\\|\//)))
})
