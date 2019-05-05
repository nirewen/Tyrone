import { EventEmitter } from 'events'
import { duration } from 'moment'

export class Song extends EventEmitter {
    constructor (data = {}, requestedBy) {
        super()

        this.track = data.track
        this.requestedBy = requestedBy || data.requestedBy

        this.identifier = data.info.identifier
        this.source = data.info.source
        this.isSeekable = data.info.isSeekable
        this.author = data.info.author
        this.length = data.info.length
        this.isStream = data.info.isStream
        this.position = data.info.position
        this.title = data.info.title
        this.uri = data.info.uri

        this.on('start', () => this.removeAllListeners('queue'))
        this.on('stop', () => this.removeAllListeners())
    }

    get formattedDuration () {
        if (this.isStream) 
            return ''

        return duration(this.length).format('hh:mm:ss', { stopTrim: 'm' })
    }
}
