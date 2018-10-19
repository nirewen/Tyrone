import Canvas from 'canvas';
import {Util, Attachment} from 'discord.js';
import {CanvasUtils} from '../../utils/CanvasUtils';
import {TicTacToe} from '../../games/TicTacToe';

const games = {};
const modes = ['easy', 'medium', 'hard'];
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const getGame = id => {
    for (let key in games)
        if (games[key].players && games[key].players.hasOwnProperty(id))
            return games[key];
    return null;
};

export const desc = 'Jogue jogo da velha pelo Discord';
export const usage = '<@usuário> | aceitar | cancelar | recusar';
export const aliases = ['jogodavelha', 'ttt', 'nac', 'noughtsandcrosses'];
export async function run(msg, suffix) {
    if (!suffix)
        return 'wrong usage';

    let [name] = suffix.split(/\s+/);

    let cmd = this.find(name.toLowerCase());

    if (cmd)
        return cmd.run.call(this, msg, suffix.split(/\s+/).slice(1));

    let mention = msg.mentions.users.first();
    
    if (mention && mention.id !== msg.author.id) {
        if (mention.bot && mention.id !== this.bot.user.id)
            return 'wrong usage';

        let mode = modes.indexOf(msg.flags.get('mode')) ? msg.flags.get('mode') : 'hard', 
            type = msg.flags.get('type') || 'x',
            jogoUser = getGame(msg.author.id),
            jogoOponente = getGame(mention.id);
            
        if (jogoUser && jogoUser.started)
            return ['Você já está em jogo'];
        if (jogoOponente)
            if (jogoOponente.started)
                return msg.channel.send('Esse usuário já está em jogo');
            else
                return msg.channel.send('Esse usuário já tem um pedido pendente');

        let game = games[msg.author.id] = new TicTacToe(msg.author.id, mode);
        game.addPlayer(msg.author, type);
        game.addPlayer(mention, type == 'o' ? 'x' : 'o');

        let m = await msg.channel.send(`Você convidou ${Util.escapeMarkdown(mention.username)} para jogar Tic-Tac-Toe!\nPara aceitar, clique na reação abaixo.`);

        let reaction = await m.react('✅');

        if (mention.id !== this.bot.user.id)
            try {
                await m.awaitReactions((r, u) => r.emoji.name == '✅' && u.id == mention.id, {time: 15E3, errors: ['time']});
            } catch(e) {
                reaction.remove();
                delete games[msg.author.id];
            }
        else
            reaction.remove();

        game.started = true;
        let opponent = game.queue[0], 
            challenger = game.queue[1];

        let canvas = new Canvas(104, 50), 
            ctx = canvas.getContext('2d'), 
            challengerAvatar = await CanvasUtils.getPolygonImage(challenger.user.avatarURL, 45, 0), 
            opponentAvatar = await CanvasUtils.getPolygonImage(opponent.user.avatarURL, 45, 0);

        ctx.drawImage(opponentAvatar, 3, 3);
        ctx.drawImage(challengerAvatar, 56, 3);
        
        ctx.save();
        ctx.globalCompositeOperation = 'destination-out';
        CanvasUtils.circle(ctx, 38, 38, 10, 0, 2 * Math.PI, {fill: 'red'});
        CanvasUtils.circle(ctx, 66, 38, 10, 0, 2 * Math.PI, {fill: 'red'});
        ctx.restore();

        let types = {
            x: await CanvasUtils.getPolygonImage('https://twemoji.maxcdn.com/2/72x72/274c.png', 16, 0),
            o: await CanvasUtils.getPolygonImage('https://twemoji.maxcdn.com/2/72x72/2b55.png', 16, 0)
        };

        ctx.drawImage(types[opponent.type], 30, 30);
        ctx.drawImage(types[challenger.type], 58, 30);

        let message = await msg.channel.send('Preparando jogo...', new Attachment(canvas.toBuffer(), 'players.png'));

        for (let i = 1; i <= 9; i++)
            await message.react(i + '⃣');
        
        message.edit(`:hash:${game.player.label}\n\n${game.render()}`);

        let col = message.createReactionCollector((r, u) => r.me && game.players.hasOwnProperty(u.id));
        
        col.on('collect', async function(r) {
            let u = r.users.find(({id}) => id !== this.message.client.user.id);

            if (game && game.player.id == u.id) {
                let supported = game.matrix.freeSpots.map(k => k.position),
                    number = parseInt(r.emoji.name, 10);

                if (supported.includes(number) && r.emoji.name == number + '⃣') {
                    game.play(number);
                    if (game.isGameWon()) {
                        if (message.guild)
                            message.clearReactions();
                        else
                            r.remove();

                        message.edit(`:hash:${game.player.label}:crown:\n\n${game.render()}`);
                        return this.stop();
                    } else if (game.matrix.freeSpots.length == 0) {
                        if (message.guild)
                            message.clearReactions();
                        else
                            r.remove();

                        message.edit(`:hash::older_woman:\n\n${game.render()}`);
                        return this.stop();
                    }

                    await game.next();

                    message.edit(`:hash:${game.player.label}\n\n${game.render()}`);
                    
                    if (message.guild)
                        r.remove(u);

                    r.remove();

                    if (game.player.user.bot) {
                        await sleep(1E3);
                        
                        let {position} = game.playBot();

                        if (game.isGameWon()) {
                            if (message.guild)
                                message.clearReactions();
                            else
                                message.reactions.get(position + '⃣').remove();

                            message.edit(`:hash:${game.player.label}:crown:\n\n${game.render()}`);
                            return this.stop();
                        } else if (game.matrix.freeSpots.length == 0) {
                            if (message.guild)
                                message.clearReactions();
                            else
                                message.reactions.get(position + '⃣').remove();

                            message.edit(`:hash::older_woman:\n\n${game.render()}`);
                            return this.stop();
                        }
                        await game.next();
                        message.edit(`:hash:${game.player.label}\n\n${game.render()}`);
                        message.reactions.get(position + '⃣').remove();
                    }
                }
            }
        });
    }
    else
        return 'wrong usage';
}