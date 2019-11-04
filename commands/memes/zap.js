import { Zapifier } from '../../api/Zapifier'

export const desc = 'Transforma sua mensagem em uma mensagem vem de zap'
export const help = `\`\`\`
Flags:
--mood     | Altera o humor do zapificador
           | - Pode ser happy, angry, sassy, sad e sick
           | - Padrão: sassy
--strength | Altera a força do zapificador
           | - Deve ser um valor de 1 a 5
           | - Padrão: 5
--raw      | Retorna uma mensagem com os emojis
\`\`\``
export const usage = '<texto>[ --strength 4 | --mood happy | --raw]'
export const aliases = ['whatsapp', 'vemdezap']
export const flags = true
export async function run (msg, text) {
    if (!text)
        return 'wrong usage'

    let mood = msg.props.get('mood')
    let strength = msg.props.get('strength')
    let raw = msg.props.has('raw')

    let { zap } = await Zapifier.zap({ text, mood, strength })

    zap = zap.slice(0, 1998)

    if (raw)
        zap = '```' + zap + '```'
    else
        zap = '\u200b' + zap

    msg.send(zap)
}
