import {Logger} from '../structures/Logger';

export default function() {
    let logger = new Logger();
    logger.logWithHeader('PRONTO', 'bgGreen', 'white', `S: ${this.guilds.size} | U: ${this.users.size} | MÉD: ${(this.users.size / this.guilds.size).toFixed(2)} | PID: ${process.pid}`);
}