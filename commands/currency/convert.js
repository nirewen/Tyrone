import { Currency } from '../../api/Currency'
import { MessageEmbed } from 'discord.js'

export const desc = 'Converte uma moeda de um valor a outro'
export const help = `Você pode converter as moedas da tabela abaixo:\`\`\`
┌─────┬─────┬─────┬─────┐
│ AUD │ BGN │ CAD │ CHF │
│ CNY │ CZK │ DKK │ GBP │
│ HKD │ HRK │ HUF │ IDR │
│ ILS │ INR │ JPY │ KRW │
│ MXN │ MYR │ NOK │ NZD │
│ PHP │ PLN │ RON │ RUB │
│ SEK │ SGD │ THB │ TRY │
│ USD │ ZAR │ EUR │ BRL │
└─────┴─────┴─────┴─────┘\`\`\``
export const usage = '<quantia> <moeda 1> <moeda 2>'
export const aliases = ['exchange']
export async function run (msg, suffix) {
    if (!suffix) return 'wrong usage'

    let arg = suffix.split(' ')

    if (!arg[0])
        return msg.send('Especifique uma quantia de moeda')

    if (!arg[1] || !arg[2])
        return 'wrong usage'

    if (arg[0] && arg[1] && arg[2]) {
        let amount = isNaN(Number(arg[0])) ? 1 : Number(arg[0])

        let res =  await Currency.fetch(amount, arg[1].toUpperCase(), arg[2].toUpperCase())

        if (res === 'no result')
            return msg.send('Alguma dessas moedas está incorreta')

        return msg.send(new MessageEmbed()
            .setTitle(`:currency_exchange: Conversão de moeda | ${arg[1].toUpperCase()} -> ${arg[2].toUpperCase()}`)
            .addField(':inbox_tray: Entrada', `${amount.toLocaleString(arg[1].toUpperCase(), { style: 'currency', currency: arg[1].toUpperCase() })}`, true)
            .addField(':outbox_tray: Saída', `${res.toLocaleString(arg[2].toUpperCase(), { style: 'currency', currency: arg[2].toUpperCase() })}`, true)
            .setColor('BLUE'))
    }
}
