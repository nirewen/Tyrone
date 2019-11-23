import { MessageEmbed } from 'discord.js'
import request from 'request-promise-native'

export const desc = 'Mostra as sugestões do Google para uma pesquisa'
export const usage = '<termos>'
export const flags = true
export async function run (msg, suffix) {
    if (!suffix)
        return 'wrong usage';

    let lang = msg.props.has('lang') ? msg.props.get('lang') : 'pt'

    const suggestions = await request.get({
        url: 'https://www.google.com/complete/search',
        qs: {
            hl: lang,
            ds: 'i',
            output: 'firefox',
            q: suffix.replace(/_$/, ' ')
        },
        json: true,
        encoding: 'latin1'
    })

    msg.send(new MessageEmbed()
        .setAuthor(`Pesquisando por ${suggestions[0]}...`, 'https://www.google.com/s2/favicons?domain=google.com')
        .setDescription(suggestions[1] != '' ? suggestions[1].join('\n') : 'o Google não sugere nada')
        .setColor('#4285F4')
    )
}
