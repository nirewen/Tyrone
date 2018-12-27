import request from 'request-promise-native'
import { GMAPS_API_KEY as key } from '@env'

export class GoogleMaps {
    static async reverse (address, filter = ['administrative_area_level_2', 'locality']) {
        const body = await this.get({ address })

        if (body.status !== 'OK' || !body.results[0].address_components.find(a => filter.some(e => a.types.includes(e))))
            throw new Error('Cidade não encontrada')

        let { lat, lng } = body.results[0].geometry.location
        let location = body.results[0].formatted_address.slice(0, 40)

        return { location, lat, lng }
    }

    static get (options) {
        return request({
            url: `https://maps.googleapis.com/maps/api/geocode/json`,
            qs: {
                ...options,
                key,
                language: 'pt-br'
            },
            json: true
        })
    }
}
