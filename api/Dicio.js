import request from 'request-promise-native'

export class Dicio {
    static fetch (word, first = false) {
        return request({ url: `https://dicio-api.now.sh/search/${word}`, json: true, qs: { first } })
    }
}
