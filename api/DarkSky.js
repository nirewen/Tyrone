import request from 'request-promise-native'
import { DARKSKY_API_KEY as key } from '@env'

export class DarkSky {
    static forecast (lat, lng) {
        return request({
            url: `https://api.darksky.net/forecast/${key}/${lat},${lng}`,
            qs: {
                lang: 'pt',
                units: 'ca'
            },
            json: true
        })
    }
}
