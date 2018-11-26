import request from 'request-promise-native'
import Sharp from 'sharp'

const BASE = 'https://api.mcsrvstat.us/1/'

export class MCServerStatus {
    static async get (ip) {
        let server = await request({ url: `${BASE}${ip}`, json: true })

        if (!server.hostname)
            server.hostname = ip

        if (!server.icon)
            server.icon = await Sharp(`${__dirname}/../src/img/default_icon.png`).toBuffer()
        else
            server.icon = Buffer.from(server.icon.split(';base64,')[1], 'base64')

        if (server.offline)
            server.icon = await Sharp(server.icon).greyscale().toBuffer()

        if (server.motd)
            server.motd.raw = server.motd.raw.join('\n\u200b').replace(/§[a-z-0-9]/gi, '')

        if (server.players && !server.players.list)
            server.players.list = ['\u200b']

        return server
    }
}
