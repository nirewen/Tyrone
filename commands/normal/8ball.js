import {RichEmbed} from 'discord.js';

// traduzido de https://en.wikipedia.org/wiki/Magic_8-Ball#Possible_answers
const answers = [
    'É certo.',
    'Certamente.',
    'Sem dúvidas.',
    'Sim - definitivamente.',
    'Pode contar com isso.',
    'Pelo que eu vejo, sim.',
    'Provavelmente.',
    'Parece bom.',
    'Sim.',
    'Os sinais apontam pra sim.',
    'Resposta vaga, tente de novo',
    'Pergunte mais tarde.',
    'Melhor não te contar.',
    'Não posso predizer agora.',
    'Concentre-se e pergunte de novo.',
    'Não conte com isso.',
    'Minha resposta é não.',
    'Minhas fontes dizem não.',
    'Não parece nada bom.',
    'Bem duvidoso.',
];

export const desc = 'Deixe a Bola 8 responder sua pergunta!';
export const usage = '<pergunta>';
export const aliases = ['ball', 'bola8'];
export async function run(msg, suffix) {
    if (!suffix)
        return 'wrong usage';

    let escolha = ~~(Math.random() * answers.length);

    return msg.channel.send(new RichEmbed()
        .setDescription(`:grey_question: | **${suffix}**\n:8ball: | **${answers[escolha]}**`)
        .setColor('#292F33'));
}