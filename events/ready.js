export async function run () {
    let { users: { size: users }, guilds: { size: guilds } } = this
    
    this.logger.logWithHeader('PRONTO', 'bgGreen', 'white', `S: ${guilds} | U: ${users} | MÉD: ${(users / guilds).toFixed(2)} | PID: ${process.pid}`)
}
