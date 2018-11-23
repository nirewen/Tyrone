const RESPONSES = [
    c => `Eu escolho **${c}**`,
    c => `**${c}** é a melhor escolha`,
    c => `**${c}** é a minha escolha`,
    c => `**${c}**, é óbvio!`,
    c => `Claro que **${c}**!`
]

export const desc = 'Faz uma escolha pra você.'
export const help = 'Escolhe uma das opções aleatoriamente. 2 escolhas, no mínimo.'
export const usage = '<escolha> | <escolha> [| escolhas...]'
export const aliases = ['c', 'pick', 'decide']
export async function run (msg, suffix) {
    if (!suffix)
        return 'wrong usage'

    let choices = suffix.split(/ ?\| ?/)
    if (choices.length < 2 && suffix.includes(','))
        choices = suffix.split(/, ?/)

    // remover vazias
    choices = choices.filter(c => c !== '')

    if (choices.length < 2)
        return 'wrong usage'

    let pick = ~~(Math.random() * choices.length)
    msg.send(RESPONSES[~~(Math.random() * RESPONSES.length)](choices[pick]))
}
