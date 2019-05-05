export const desc = 'Crie comandos customizados no Tyrone'
export const help = [
    'Comandos:',
    '```',
    'list       | Mostra a lista de comandos do servidor',
    'test       | Testa um script de comando',
    'create     | Cria um comando',
    'edit       | Edita um comando seu',
    'delete     | Deleta um comando seu',
    'raw        | Mostra o script de um comando',
    '```'
]
export const usage = '<comando>'
export const aliases = ['cmd']
export async function run (msg, suffix) {
    if (!suffix)
        return msg.send(this.helpMessage)
}
