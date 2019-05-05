import { functions, parser, lexer, constructor } from 'tatsuscript'
import * as Functions from './Functions'

class TatsuScript extends constructor {
    constructor () {
        super(functions, parser, lexer)

        this.files = []
        this.embeds = []
        this.prefix = 'ty!'
        this.aliases = []

        for (let [name, func] of Object.entries(Functions))
            this.registerFunction(name, func)
    }

    run (script, context) {
        this.script = script
        this.context = context

        this.content = '\u200e' + this.interpret(script)
    
        let command = JSON.parse(JSON.stringify(this))

        this.reset()

        return command
    }

    reset () {
        this.files = []
        this.embeds = []
        this.currentVar = null
        this.script = null
        this.prefix = 'ty!'
        this.usage = null
        this.desc = null
        this.help = null
        this.cooldown = null
        this.hidden = null
        this.aliases = []
    }
}

export default new TatsuScript()
