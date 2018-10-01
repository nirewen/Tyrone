import {osu} from '../../utils/utils.js';
import {Attachment} from 'discord.js';

const modes = ['', 'taiko', 'catch', 'mania'];
const colors = {
    'red'      : '#ee3333',
    'orange'   : '#ee8833',
    'yellow'   : '#ffcc22',
    'green'    : '#aadd00',
    'blue'     : '#66ccff',
    'purple'   : '#8866ee',
    'pink'     : '#ff66aa',
    'dark blue': '#2255ee',
    'dark pink': '#bb1177',
    'black'    : '#000000',
};

export const desc = 'Mostra a tua assinatura com dados do osu!';
export const usage = '<usuário>[ --color cor --mode modo]';
export const cooldown = 2;
export async function run(msg, suffix) {
    if (!suffix)
        return 'wrong usage';
    let user  = suffix, 
        mode  = msg.flags.get('mode'), 
        color = msg.flags.get('color') || 'pink';

    mode = modes.indexOf(mode) > -1 ? modes.indexOf(mode) : 0;

    if (colors[color])
        color = colors[color];

    let img = await osu(user, mode, encodeURIComponent(color));

    msg.channel.send(new Attachment(img, `${suffix}.png`));
}