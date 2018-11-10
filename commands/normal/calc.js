import math from 'mathjs'

export const desc = 'Calcula uma conta ou uma regra de 3'
export const help = '```\nUse a regra de 3 como se estivesse vendo assim:\na ---- b\nc ---- x```'
export const usage = '<cálculo> | reg3 a b c [x]'
export async function run (msg, suffix) {
    if (!suffix)
        return 'wrong usage'

    function calc (text) {
        var res
        try {
            res = math.eval(text)
            return res
        } catch (e) {
            return '```diff\n- Erro: ' + e.message + '\n' + suffix + '\n' + ' '.repeat(e.char - 1) + '^```'
        }
    }

    return msg.send(`${calc(suffix)}`)
}
