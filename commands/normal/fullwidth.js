const fullwidth = (text) => {
    let temp = "";
    for (let char of text) {
        if (char == ' ') {
            char = String.fromCharCode(0x3000);
        }
        else
            char = String.fromCharCode(char.charCodeAt(0) + 0xFEE0);
        temp += char;
    }
    return temp;
}

export const desc = "Formata seu texto em ＡＥＳＴＨＥＴＩＣ";
export const cooldown = 3;
export const usage = "<texto>";
export const aliases = ['fw', 'aesthetic'];
export async function run(msg, suffix) {
    if (suffix)
        msg.channel.send(fullwidth(suffix));
    else
        return 'wrong usage';
}