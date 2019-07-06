import cheerio from 'cheerio'
import request from 'request-promise-native'

const headers = {
    'accept-language': 'en-US,en;q=0.9',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.102 Safari/537.36 Vivaldi/2.0.1309.37'
}
const BASE = 'https://namemc.com'

export class NameMC {
    static async getNicknames (uuid) {
        let $ = await this.get(`${BASE}/profile/${uuid}`)

        return $('.card.mb-3').eq(1).find('.card-body').children().map((_i, e) => {
            let index = $(e).find('.order-md-1').text()
            let username = $(e).find('.order-md-2').text()
            let date = $(e).find('.order-md-3 time').attr('datetime')

             if (date)
                 date = new Date(date)

             return { index, username, date }
        }).get()
    }

    static async getName (uuid) {
        let $ = await this.get(`${BASE}/profile/${uuid}`)

        return $('.container h1').text()
    }

    static async search (name) {
        let $ = await this.get(`${BASE}/search?q=${name}`)

        return Promise.all($('.card.mb-3').map(async (_i, e) => {
            let name = $(e).find('.mb-0').text()
            let uuid = $(e).find('samp').text()
            let nicknames = await this.getNicknames(uuid)
        
            return { name, nicknames, uuid }
        }).get())
    }

    static get (url) {
        return request({ url, headers, transform: cheerio.load })
    }
}
