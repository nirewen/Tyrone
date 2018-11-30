import * as firebase from 'firebase-admin'

export class Firebase {
    constructor ({ serviceAccount, databaseURL }) {
        firebase.initializeApp({
            credential: firebase.credential.cert(serviceAccount),
            databaseURL
        })
    }

    get database () {
        return firebase.database()
    }

    get (path) {
        return this.database.ref(path).once('value')
    }
}
