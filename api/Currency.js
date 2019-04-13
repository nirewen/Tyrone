import request from 'request-promise-native'
import { CCA_API_KEY } from '@env'

export class Currency {
    static async fetch (amount, from, to) {
        let res = await request({
            url: 'http://free.currencyconverterapi.com/api/v6/convert',
            qs: {
                q: from + '_' + to,
                apiKey: CCA_API_KEY
            },
            json: true
        })

        if (res.query.count === 0)
            return this.fetchCrypto(amount, from, to)
        else
            return amount * res.results[`${from}_${to}`].val
    }

    static async fetchCrypto (amount, from, to) {
        let res = await request({
            url: 'https://min-api.cryptocompare.com/data/price',
            qs: {
                fsym: from,
                tsyms: to
            },
            json: true
        })

        if (res['Response'])
            return 'no result'
        else
            return amount * res[to]
    }
}
