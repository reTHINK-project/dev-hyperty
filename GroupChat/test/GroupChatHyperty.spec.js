import { expect } from 'chai'
import rethink from './resources/.well-known/runtime/rethink'

describe('Group Chat Hyperty', () => {
    describe('create chat', () => {
        xit('should return a new chat instance', (done) => {
        })
    })

    describe('create chat with a list of participants', () => {
        it('should return a new chat instance', (done) => {
            let groupChat = 'hyperty-catalogue://localhost/.well-known/hyperty/GroupChatHyperty'    

            rethink.install({domain: 'localhost', development: true})
                .then((runtime) =>{
                    runtime.requireHyperty(groupChat).then((result) => {
                        let chat = result.instance.create('test', [{email: 'openidtest10@gmail.com', domain: 'localhost'}])
                        expect(chat).to.exist
                        done()
                    }) 
                })
        })
    })
})
