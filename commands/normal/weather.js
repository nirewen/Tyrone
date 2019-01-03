import { MessageAttachment, MessageEmbed } from 'discord.js'
import { Weather } from '../../utils/Weather'

export const desc = 'Retorna as informações do clima de uma cidade'
export const help = 'Você pode definir a sua cidade usando ty!weather --city nome'
export const usage = '[<cidade>] | --city sua cidade'
export const aliases = ['w', 'clima']
export const cooldown = 5
export const flags = true
export async function run (msg, suffix) {
    if (!suffix && !msg.flags.has('city')) {
        let city = await this.bot.database.get(`users/${msg.author.id}/city`).then(d => d.val())

        if (city)
            suffix = city.trim()
        else
            return 'wrong usage'
    }

    if (msg.flags.has('city')) {
        let city = msg.flags.get('city')

        this.bot.database.set(`users/${msg.author.id}/city`, city)
        return msg.send(`Sua cidade foi definida para ${city}`)
    }

    try {
        const card = await Weather.card(suffix).then(canvas => canvas.toBuffer())

        msg.send(new MessageAttachment(card, 'weather.png'))
    } catch (e) {
        msg.send(new MessageEmbed()
            .setAuthor('Clima', 'https://png.icons8.com/no-rain/dusk/128')
            .setDescription(e.message)
            .setColor('RED'))
    }
}
