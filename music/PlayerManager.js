import Lavalink from 'discord.js-lavalink'
import snekfetch from 'snekfetch'
import { Player, Song } from './structures'

const DEFAULT_JOIN_OPTIONS = { selfdeaf: true }

const defaultRegions = {
    asia: [ 'sydney', 'singapore', 'japan', 'hongkong' ],
    eu: [ 'london', 'frankfurt', 'amsterdam', 'russia', 'eu-central', 'eu-west', 'southafrica' ],
    us: [ 'us-central', 'us-west', 'us-east', 'us-south' ],
    sam: [ 'brazil' ]
}

const resolveRegion = (region) => {
    region = region.replace('vip-', '')
    const dRegion = Object.entries(defaultRegions).find(([_, r]) => r.includes(region))
    return dRegion && dRegion[0]
}

export class PlayerManager extends Lavalink.PlayerManager {
    constructor (client, nodes = [], options = {}) {
        options.player = Player
        super(client, nodes, options)

        this.REST_ADDRESS = `${nodes[0].host}:${nodes[0].port}`
        this.REST_PASSWORD = nodes[0].password
    }

    onMessage (message) {
        if (!message || !message.op)
            return

        const player = this.get(message.guildId)

        if (!player)
            return
            
        return player.event(message)
    }

    async fetchTracks (identifier) {
        const res = await snekfetch.get(`http://${this.REST_ADDRESS}/loadtracks`)
            .query({ identifier })
            .set('Authorization', this.REST_PASSWORD)
            .catch(e => {
                this.client.logError(new Error(`Lavalink fetchTracks ${e}`))
            })

        const { body } = res

        if (!body) 
            return false
        if (['LOAD_FAILED', 'NO_MATCHES'].includes(body.loadType) || !body.tracks.length) 
            return body.loadType !== 'LOAD_FAILED'

        const songs = body.tracks
        songs.searchResult = body.loadType === 'SEARCH_RESULT'
        return songs
    }

    async loadTracks (identifier, requestedBy) {
        const songs = await this.fetchTracks(identifier)
    
        if (songs && songs.length > 0) {
            const { searchResult } = songs

            if (songs.searchResult || songs.length === 1) {
                const [ song ] = songs
    
                return searchResult.setResult(new Song(song, requestedBy).loadInfo())
            }
        }
    }

    async play (song, channel) {
        if (song && song instanceof Song) {
            const host = this.getIdealHost(channel.guild.region)
            const player = this.join({
                guild: channel.guild.id,
                channel: channel.id,
                host
            }, DEFAULT_JOIN_OPTIONS)

            player.play(song)
            return song
        }
        return null
    }

    getIdealHost (region) {
        region = resolveRegion(region)
        const { host } = (region && this.nodes.find(n => n.ready && n.region === region)) || this.nodes.first()

        return host
    }
}
