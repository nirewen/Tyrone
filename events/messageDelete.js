export default async function (msg) {
    if (msg.command)
        msg.response.delete()
}
