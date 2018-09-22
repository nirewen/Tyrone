const getMatches = (string, regex) => {
    var matches = [];
    var match;
    while (match = regex.exec(string)) {
        matches.push([match[1], match[2]]);
    }
    return matches;
}

export class Command {
    constructor(name, prefix, cmd, bot) {
        this.name = name;
        this.prefix = prefix;
        this.bot = bot;
        this.aliases = cmd.aliases || [];
        this.cooldown = cmd.cooldown || 0;
        this.hidden = cmd.hidden || false;
        this.ownerOnly = cmd.ownerOnly || false;
        this.run = cmd.run;
    }

    process(msg, suffix) {
        if (msg.author.bot)
            return;

        if (this.ownerOnly && msg.author.id !== this.bot.ownerId)
            return;

        let regex = /--(\w+)\s?(.+?(?=--|$))?/g;
        let flags = new Map();
        getMatches(suffix, regex).forEach(k =>
            flags.set(k[0], k[1] && k[1].trim())
        );
        suffix = suffix.replace(regex, '').trim();

        msg.flags = flags;

        return this.run(msg, suffix);
    }
}