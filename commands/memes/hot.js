import {Attachment} from 'discord.js';
import Canvas from 'canvas';
import fs from 'fs';
import request from 'request-promise-native';

export const desc = 'Mostra as coisas mais quentes do mundo';
export const usage = '<@user>';
export async function run(msg, suffix) {
    if (!msg.mentions.members.first()) 
        return 'wrong usage';
    
    let bg     = new Canvas.Image,
        avatar = new Canvas.Image,
        {Font} = Canvas,
        member = msg.mentions.members.first();

    new Font("Coolvetiva", __dirname + "/../../src/font/coolvetica.ttf");
        
    bg.src = fs.readFileSync('src/img/hot.jpg');
    avatar.src = await request({url: member.user.avatarURL, encoding: null});
    
    let canvas = new Canvas(bg.width, bg.height),
        ctx    = canvas.getContext('2d');
        
    ctx.drawImage(bg, 0, 0); 
    ctx.drawImage(avatar, 271, 470, 197, 197);
    ctx.font = '30px Coolvetica';
    ctx.textAlign = "center";
    ctx.textBaseline = "top"; 
    ctx.translate(369, 665);
    ctx.fillText(member.displayName, 0, 0);
    ctx.font = '500 25px Coolvetica';
    ctx.fillText((Number(member.user.discriminator) * 100000).toLocaleString('pt-BR') + '°C', 0, 34);
    

    msg.channel.send(new Attachment(canvas.toBuffer(), 'hot.png'));
}