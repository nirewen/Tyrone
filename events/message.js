export async function run (msg) {
    let category = this.categories.find(c => msg.content.toLowerCase().startsWith(c.prefix))

    if (category)
        return category.process(msg)

    if (msg.command) {
        msg.command = false
        if (msg.response) {
            msg.response.delete()
            delete msg.response
        }
    }

    if (new RegExp(`^<@!?${msg.guild.me.id}> ?comandos$`).test(msg.content))
        msg.send(this.categories.list.embed)
}
