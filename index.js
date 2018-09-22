import Discord from 'discord.js';
import fs from 'fs';
import config from './config.json';
import {Category} from './structures/Category';
import {Logger} from './structures/Logger';
import {TOKEN, OWNER_ID} from "@env"

const logger = new Logger();
const bot = new Discord.Client({disableEveryone: true});

bot.categories = [];
bot.ownerId = OWNER_ID;

function initEvents() {
	return new Promise(resolve => {
		fs.readdirSync('./events').forEach(file => {
			if (file.endsWith('.js')) {
				try {
					let name = file.split(/\.js$/)[0];
					bot.on(name, require(`./events/${file}`).default);
					resolve();
				} catch (e) {
					console.log(e);
				}
			}
		});
	});
};

function loadCommandSets() {
	return new Promise(resolve => {
		for (let prefix in config.commandSets) {
			let {name, dir, color} = config.commandSets[prefix];
			bot.categories.push(new Category(name, prefix, dir, color));
		}
		resolve();
	});
}

function initCategories(index = 0) {
	return new Promise((resolve, reject) => {
		bot.categories[index].initialize(bot)
			.then(() => {
				logger.debug(`Carregado categoria ${bot.categories[index].name}`, 'CATEG');
				index++;
				if (bot.categories.length > index) {
					initCategories(index)
						.then(resolve)
						.catch(reject);
				} else
					resolve();
			}).catch(reject);
	});
}

function login() {
	bot.login(TOKEN).catch(error => {
		console.error(error, 'LOGIN ERROR');
	});
}

loadCommandSets()
	.then(initCategories)
	.then(initEvents)
	.then(login)
	.catch(error => {
		console.error(error, 'ERROR IN INIT');
	});