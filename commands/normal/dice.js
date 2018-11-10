import { MessageEmbed } from 'discord.js'

const s = n => n > 1 ? 's' : ''
const rolar = async (dados, lados, soma) => {
    let final = []
    while (dados--)
        final.push(~~(Math.random() * lados) + 1)

    return {
        resultado: final.reduce((ant, curr) => ant + curr) + soma,
        rolados: final.join(' + ') + (soma ? ` + ${soma}` : '')
    }
}

export const desc = 'Rola 1 dado de 6 lados ou x dados de x lados'
export const details = 'A sintaxe padrão é DdL +S, sendo D o número de Dados, L o número de Lados e S a Soma ao resultado final. Por padrão, 1 dado de 6 lados é rolado se não for especificado'
export const aliases = ['dado']
export const usage = '[D[dL] [+S]]'
export const cooldown = 3
export async function run (msg, str) {
    let round  = (n, max, min, def = 1) => !isNaN(n) ? n > max ? max : n < min ? min : n : def
    let suffix = str.split(' ')
    let values = suffix[0].split('d').map(n => Math.abs(Number(n)))
    let dados  = round(values[0], 99, 1)
    let lados  = round(values[1], 99, 1, 6)
    let soma   = round(suffix[1], 1000, -1000, 0)

    let res    = await rolar(dados, lados, soma)

    msg.send(new MessageEmbed()
        .setTitle(':game_die: Dados')
        .setDescription(`${dados} dado${s(dados)} de ${lados} lado${s(lados)}`)
        .addField(`Resultado: \`${res.resultado}\``, `${res.rolados} = **${res.resultado}**`)
        .setColor('#ea596e'))
}
