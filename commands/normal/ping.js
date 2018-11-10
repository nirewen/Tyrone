export const desc = 'Responde com o ping.'
export const details = 'Usado pra ver se eu tô funcionando.\nResponde com o atraso de resposta.'
export const aliases = ['p']
export const cooldown = 2
export async function run (msg) {
    let m = await msg.send(':ping_pong: Pong!')

    m.edit(m.content + `**${m.timestamp - (msg.editedTimestamp || msg.timestamp)}**ms`)
}
