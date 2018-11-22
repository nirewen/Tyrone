export default function (msg) {
    for (let category of this.categories) {
        if (msg.content.toLowerCase().startsWith(category.prefix))
            return category.process(msg)
    }

    if (msg.command) {
        msg.command = false
        if (msg.response) {
            msg.response.delete()
            delete msg.response
        }
    }
}
