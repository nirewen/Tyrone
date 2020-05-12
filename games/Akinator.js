import aki from 'aki-api'

import { Game } from './structures/Game'
import { AbstractPlayer as Player } from './structures/AbstractPlayer'

export class Akinator extends Game {
    constructor () {
        super()

        this.region = 'pt'
    }

    addPlayer (member) {
        if (!this.players.has(member.id)) {
            let player = new Player(member, this)
            this.players.set(member.id, player)

            this.queue.push(player)
            return player
        } else
            return null
    }

    async create () {
        let { session, signature, question } = await aki.start(this.region)
        
        this.started = true
        this.session = session
        this.signature = signature
        this.step = 0
        this.progress = 0

        return question
    }

    async answer (answer) {
        let { region, session, signature, step } = this

        try {
            let { nextQuestion: question, progress, nextStep } = await aki.step(region, session, signature, answer, step)

            this.progress = Math.floor(progress)
            this.step = nextStep

            if (this.progress >= 95)
                return this.end()

            return question
        } catch (e) {
            this.end()
        }
    }

    async cancel () {
        let { region, session, signature, step } = this

        try {
            let { nextQuestion: question, progress, nextStep } = await aki.back(region, session, signature, -1, step)

            this.progress = Math.floor(progress)
            this.step = nextStep

            if (this.progress >= 95)
                return this.end()

            return question
        } catch (e) {
            this.end()
        }
    }

    async end () {
        let { region, session, signature, step } = this

        try {
            let { answers, guessCount: guesses } = await aki.win(region, session, signature, step)

            let { absolute_picture_path: image, description, ranking, name } = answers[0]

            return { finished: true, image, description, ranking, name, guesses }
        } catch (e) {
            if (e.message.endsWith('KO - ELEM LIST IS EMPTY'))
                return { expired: true }
        }
    }

    get progressBar () {
        let percentage = Math.round(this.progress / 10)
        let remaining = 10 - percentage

        return `${'█'.repeat(percentage)}${'▁'.repeat(remaining)}`
    }
}
