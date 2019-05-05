import Token from 'tatsuscript/dist/Core/Token'
import variables from 'tatsuscript/dist/Functions/Common/variables'

export default function (name, index) {
    name = this.interpret(name)

    if (!variables[this.context.guild.id])
        variables[this.context.guild.id] = {}
    if (!variables[this.context.guild.id][this.context.command.name])
        variables[this.context.guild.id][this.context.command.name] = {}

    let variable = variables[this.context.guild.id][this.context.command.name][name]

    if (!variable || (this.currentVar && this.currentVar === name)) {
        return ''
    }

    if (variable.length === 1) {
        index = new Token('WORD', '0')
    }
    
    if (index) index = this.interpret(index)

    this.currentVar = name

    if (index)
        return this.interpret(variable[index])
    else
        return '[' + variable.map(v => this.interpret(v)).join(', ') + ']'
};
