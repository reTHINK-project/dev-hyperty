import { assert } from 'chai'
import MiniBus from 'runtime-core/dist/minibus'
import activate from '../src'

describe('GroupChat', () =>{
    describe('add participant', () => {
        it('should notify invited participant and add it to the list of participants', () => {
            let name = 'test chat'
            let bus = new MiniBus()
            let configuration = {runtimeURL: "runtime://localhosy/2484"}
            let hypertyURL_main = "hyperty://localhost/e1b25389-2189-482e-b340-673be37eb3fc"
            let hypertyURL_guest = "hyperty://localhost/e1b25389-1234-482e-b340-673be37eb3fc"
            let groupChatHy_main = activate(hypertyURL_main, bus, configuration).instance
            let groupChatHy_guest = activate(hypertyURL_guest, bus, configuration).instance
            let chat = groupChatHy_main.create(name)
            let new_chat = undefined
            let new_participant = 'test@test.com'

            groupChatHy_guest.onAdd((chat) => {
                new_chat = chat
            }) 
            chat.addParticipant(new_participant);

            assert.include(chat.participants, new_participant)
            assert.isDefined(new_chat)
        })
    })
})
