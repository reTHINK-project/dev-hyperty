import { assert } from 'chai'
import MiniBus from 'runtime-core/dist/minibus'
import activate from '../src'

describe('Group Chat Hyperty', () => {
    describe('create chat', () => {
        it('should return a new chat instance', () => {
            let name = 'test chat'
            let bus = new MiniBus()
            let configuration = {runtimeURL: "runtime://localhosy/2484"}
            let hypertyURL = "hyperty://localhost/e1b25389-2189-482e-b340-673be37eb3fc"
            let groupChatHy_main = activate(hypertyURL, bus, configuration).instance
            let chat = groupChatHy_main.create(name)

            assert.isDefined(chat)
        })
    })

})
