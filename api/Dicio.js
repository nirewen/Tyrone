import request from 'request-promise-native'

export class Dicio {
    static fetch (word) {
        return request({ url: `https://dicio-api.now.sh/word/${word}`, json: true })
    }
}
