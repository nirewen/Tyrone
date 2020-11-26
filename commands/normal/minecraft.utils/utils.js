const usernameRegex = /^\w{3,32}$/
const serverRegex = /^[A-Za-z0-9_\.]{4,}(:\d+)?$/

export function validateUsername (username) {
    return usernameRegex.test(username)
}

export function validateServer (server) {
    return serverRegex.test(server)
}
