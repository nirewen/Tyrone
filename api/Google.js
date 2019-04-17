import { google } from 'googleapis'
import { CSE_ID as cx } from '@env'
import { CSE_API as auth } from '@env'

const search = google.customsearch('v1')

export class Google {
    static search (q) {
        return search.cse.list({ auth, cx, q })
    }

    static image (q) {
        return search.cse.list({ auth, cx, q, searchType: 'image' })
    }
}
