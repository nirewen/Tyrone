export const desc = 'Cara ou coroa.';
export const usage = '<cara | coroa | heads | tails | h | t>';
export const aliases = ['coin', 'flip'];
export async function run(msg, suffix) {
    if (!suffix)
        return 'wrong usage';

    let bet = suffix[0] == 'h' || suffix == 'cara' ? 'cara' :
              suffix[0] == 't' || suffix == 'coroa' ? 'coroa' : null,
        flip = Math.random() < 0.5 ? 'cara' : 'coroa';

    if (!bet)
        return 'wrong usage';

    if (bet == flip)
        return msg.channel.send(`Você apostou em **${bet}** e ganhou!`);
    else
        return msg.channel.send(`Você apostou em **${bet}** e perdeu...`);
}