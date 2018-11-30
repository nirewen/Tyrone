import cheerio from 'cheerio'
import request from 'request-promise-native'

const headers = {
    'accept-language': 'en-US,en;q=0.9',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.102 Safari/537.36 Vivaldi/2.0.1309.37'
}
const BASE = 'https://mine.ly'

export class NameMC {
    static async getNicknames (uuid) {
        let $ = await request({ url: `${BASE}/${uuid}`, headers, transform: cheerio.load })

        return $('.card.mb-3').eq(1).find('.list-group').children().map((_i, e) => {
            let index = $(e).find('.row .order-md-1').text()
            let username = $(e).find('.row .order-md-2').text()
            let date = $(e).find('.row .order-md-3 time').attr('datetime')
            
            if (date)
                date = new Date(date)
                
            return { index, username, date }
        }).get()
    }
}
