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

    ref (path) {
        return this.database.ref(path)
    }

    get (path) {
        return this.ref(path).once('value')
    }

    set (path, value) {
        return this.ref(path).set(value)
    }
}
