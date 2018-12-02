export async function run (msg) {
    if (msg.command)
        if (msg.response)
            msg.response.delete()
}
