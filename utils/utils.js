import request from 'request-promise-native';

export async function osu(user, mode, color) {
    let url = `https://lemmmy.pw/osusig/sig.php?colour=${color}&uname=${user}&pp=1&darktriangles&mode=${mode}&xpbar&xpbarhex`;

    return await request({url, encoding: null});
}

export function findRole(query, guild, exact = false) {
    let found = null;
    if (query === undefined || guild === undefined)
        return found;
        
    query = query.toLowerCase();
    guild.roles.forEach(r => { if (r.name.toLowerCase() === query) found = r; });
    if (!found && !exact) guild.roles.forEach(r => { if (r.name.toLowerCase().indexOf(query) === 0) found = r; });
    if (!found && !exact) guild.roles.forEach(r => { if (r.name.toLowerCase().includes(query)) found = r; });
    return found;
}

export function findMember(query, guild, exact = false) {
    let found = null;
    if (query === undefined || guild === undefined)
        return found;
    query = query.toLowerCase();
    guild.members.forEach(m => { if (m.user.username.toLowerCase() === query) found = m; });
    if (!found) guild.members.forEach(m => { if (m.nickname !== null && m.nickname.toLowerCase() === query) found = m; });
    if (!found && !exact) guild.members.forEach(m => { if (m.user.username.toLowerCase().indexOf(query) === 0) found = m; });
    if (!found && !exact) guild.members.forEach(m => { if (m.nickname !== null && m.nickname.toLowerCase().indexOf(query) === 0) found = m; });
    if (!found && !exact) guild.members.forEach(m => { if (m.user.username.toLowerCase().includes(query)) found = m; });
    if (!found && !exact) guild.members.forEach(m => { if (m.nickname !== null && m.nickname.toLowerCase().includes(query)) found = m; });
    return found;
}

export function findGuild(query, guilds, exact = false) {
    let found = null;
    if (query === undefined || guilds === undefined)
        return found;
        
    query = query.toLowerCase();
    guilds.forEach(g => { if (g.name.toLowerCase() === query) found = g; });
    if (!found && !exact) guilds.forEach(g => { if (g.name.toLowerCase().indexOf(query) === 0) found = g; });
    if (!found && !exact) guilds.forEach(g => { if (g.name.toLowerCase().includes(query)) found = g; });
    return found;
}

export function findUserInGuild(query, guild, exact = false) {
    let found = null;
    if (query === undefined || guild === undefined)
        return found;
        
    query = query.toLowerCase();
    guild.members.forEach(m => { if (m.user.username.toLowerCase() === query) found = m; });
    if (!found) guild.members.forEach(m => { if (m.nickname !== null && m.nickname.toLowerCase() === query) found = m; });
    if (!found && !exact) guild.members.forEach(m => { if (m.user.username.toLowerCase().indexOf(query) === 0) found = m; });
    if (!found && !exact) guild.members.forEach(m => { if (m.nickname !== null && m.nickname.toLowerCase().indexOf(query) === 0) found = m; });
    if (!found && !exact) guild.members.forEach(m => { if (m.user.username.toLowerCase().includes(query)) found = m; });
    if (!found && !exact) guild.members.forEach(m => { if (m.nickname !== null && m.nickname.toLowerCase().includes(query)) found = m; });
    return found === null ? found : found.user;
}

export async function findUser(guild, id) {
    if (guild.members.has(id)) {
        return guild.members.get(id);
    } else {
        let bot  = guild.client,
            user = await bot.fetchUser(id);
        return user;
    }
}