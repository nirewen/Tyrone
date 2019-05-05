import variables from 'tatsuscript/dist/Functions/Common/variables'

export default function (name, ...values) {
    if (!name)
        return '`Invalid variable name`'
    
    name = this.interpret(name)

    if (!variables[this.context.guild.id])
        variables[this.context.guild.id] = {}
    if (!variables[this.context.guild.id][this.context.command.name])
        variables[this.context.guild.id][this.context.command.name] = {}

    if (['prefix', 'usage', 'desc', 'help', 'cooldown', 'hidden'].includes(name))
        this[name] = this.interpret(values[0])
    if (name === 'aliases')
        this.aliases = values.map(v => this.interpret(v))

    this.prefix = Object.keys(require('../../../config.json').commandSets).includes(this.prefix) ? this.prefix : 'ty!'
        
    variables[this.context.guild.id][this.context.command.name][name] = values

    return ''
};
