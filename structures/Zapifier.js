import request from 'request-promise-native'

const url = 'http://vemdezapbe.be/api/v1.0/zap'

export class Zapifier {
    static async zap ({ text, strength = 5, mood = 'sassy', rate = 1 }) {
        if (!text)
            throw new Error('\'text\' parameter is required')

        let res = await request.post({
            url,
            body: {
                zap: text,
                mood,
                strength,
                rate
            },
            json: true
        })

        return res
    }
}
