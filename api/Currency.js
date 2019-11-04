import request from 'request-promise-native'
import { CCA_API_KEY } from '@env'

export class Currency {
    static async fetch (amount, from, to) {
        let res = await request({
            url: 'https://api.exchangeratesapi.io/latest',
            qs: {
		base: from,
		symbols: to
            },
            json: true
        }).catch(({ error }) => ({ error }));

        if (res.error)
            return this.fetchCrypto(amount, from, to)
        else
            return amount * res.rates[to]
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
