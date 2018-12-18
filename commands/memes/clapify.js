export const desc = 'Quando👏você👏quer👏destacar👏suas👏falas'
export const usage = '<texto>'
export async function run (msg, suffix) {
    if (!suffix)
        return 'wrong usage'
    
    msg.send(` ${suffix} `.replace(/\s+/g, '👏'))
}
