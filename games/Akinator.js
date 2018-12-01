import request from 'request-promise-native'
import { xml2js as convert } from 'xml-js'

const BASE = 'http://62.4.22.192:8166/ws/'

import { Game } from './structures/Game'
import { AbstractPlayer } from './structures/AbstractPlayer'

export class Akinator extends Game {
    get player () {
        return this.queue[0]
    }

    addPlayer (member) {
        if (!this.players[member.id]) {
            let player = this.players[member.id] = new AbstractPlayer(member, this)

            this.queue.push(player)
            return player
        } else
            return null
    }

    async create () {
        let { result: { parameters: { identification: { session, signature }, step_information: { step, question } } } } = await this.get('new_session.php')
        
        this.started = true
        this.session = session
        this.signature = signature
        this.step = step
        this.progression = 0

        return question
    }

    async answer (answer) {
        let { step: currentStep } = this
        let { result: { completion, ...result } } = await this.get('answer.php', { step: currentStep, answer })

        if (completion === 'KO - TIMEOUT')
            return this.end()

        let { parameters: { progression, question, step } } = result

        this.progression = progression
        this.step = step

        if (progression >= 95)
            return this.end()

        return question
    }

    async cancel () {
        let { step: currentStep } = this
        let { result: { completion, ...result } } = await this.get('cancel_answer.php', { step: currentStep })

        if (completion === 'KO - TIMEOUT')
            return this.end()

        let { parameters: { progression, question, step } } = result

        this.progression = progression
        this.step = step

        if (progression >= 95)
            return this.end()

        return question
    }

    async end () {
        let { step } = this
        let { result: { completion, ...result } } = await this.get('list.php', { step, size: 1 })

        if (completion === 'KO - ELEM LIST IS EMPTY')
            return { expired: true }

        let { parameters: { elements: { element: { absolute_picture_path: image, description, ranking, name } } } } = result

        return { finished: true, image, description, ranking, name }
    }

    get progressionBar () {
        let percentage = Math.round(this.progression / 10)
        let remaining = 10 - percentage

        return `${'█'.repeat(percentage)}${'▁'.repeat(remaining)}`
    }

    get (path, qs = {}) {
        qs.partner = 410
        qs.constraint = "ETAT<>'AV'"
        qs.session = this.session
        qs.signature = this.signature

        return request({
            url: BASE + path,
            qs,
            transform: body => convert(body, {
                compact: true,
                trim: true,
                ignoreDeclaration: true,
                ignoreInstruction: true,
                ignoreAttributes: true,
                ignoreComment: true,
                ignoreCdata: true,
                ignoreDoctype: true,
                elementNameFn: val => val.toLowerCase(),
                textFn: (value, parentElement) => {
                    try {
                        let keyNo = Object.keys(parentElement._parent).length
                        let keyName = Object.keys(parentElement._parent)[keyNo - 1]
                        parentElement._parent[keyName] = this.nativeType(value)
                    } catch (e) {}
                }
            })
        })
    }

    nativeType (value) {
        let nValue = Number(value)

        if (!isNaN(nValue))
            return nValue

        let bValue = value.toLowerCase()

        if (bValue === 'true')
            return true
        else if (bValue === 'false')
            return false

        return value
    }
}
