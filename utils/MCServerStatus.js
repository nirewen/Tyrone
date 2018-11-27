import request from 'request-promise-native'
import Sharp from 'sharp'

const BASE = 'https://api.mcsrvstat.us/1/'

export class MCServerStatus {
    static async get (ip) {
        let server = await request({ url: `${BASE}${ip}`, json: true })

        if (!server.hostname)
            server.hostname = ip

        server.icon = `https://mcservericon.now.sh/?server=${server.hostname}`

        if (server.offline)
            server.icon = await Sharp(server.icon).greyscale().toBuffer()

        if (server.motd)
            server.motd.raw = server.motd.raw.join('\n\u200b').replace(/§[a-z-0-9]/gi, '')

        if (server.players && !server.players.list)
            server.players.list = ['\u200b']

        return server
    }
}
