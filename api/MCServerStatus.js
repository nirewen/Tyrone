import request from 'request-promise-native'

const BASE = 'https://api.mcsrvstat.us/1/'

export class MCServerStatus {
    static async get (ip) {
        let server = await request({ url: `${BASE}${ip}`, json: true })

        if (!server.hostname)
            server.hostname = ip

        server.icon = `https://mcservericon.now.sh/?server=${server.hostname}`

        if (server.motd)
            server.motd.clean = server.motd.clean.join('\n\u200b')

        if (server.players && !server.players.list)
            server.players.list = ['\u200b']

        return server
    }
}
