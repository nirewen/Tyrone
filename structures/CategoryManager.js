import { Collection, MessageEmbed } from 'discord.js'

export class CategoryManager extends Collection {
    constructor (bot, ...categories) {
        super()

        this.bot = bot

        for (let category of categories)
            this.set(category.name, category)
    }

    get list () {
        let categories = this

        categories.toFields = () => categories.map(({ prefix, name: category, commands }) => {
            commands = commands.filter(c => !c.hidden)

            let name = `\`${prefix}\`  ${category}`
            let value = commands.map(c => `\`${c.name}\``).join(' ')
          
            return { name, value }
        })

        categories.embed = new MessageEmbed()
            .setAuthor('Comandos do Tyrone', this.bot.user.displayAvatarURL())
            .addFields(categories.toFields())
            .setFooter('Em breve mais comandos! • Você pode sugerir enviando uma mensagem a Nirewen#9011')
            .setColor('ORANGE')

        return categories
    }
}