import { expect } from 'chai'
import rethink from './resources/.well-known/runtime/rethink'

describe('Group Chat Hyperty', () => {
    describe('create chat', () => {
        it('should return a new chat instance', (done) => {
            let groupChat = 'hyperty-catalogue://localhost/.well-known/hyperty/GroupChatHyperty'    

            rethink.install({domain: 'localhost', development: true})
                .then((runtime) =>{
                    runtime.requireHyperty(groupChat).then((result) => {
                        let chat = result.instance.create('test', [])
                        expect(chat).to.exist
                        done()
                    }) 
                })
        })
    })

    describe('create chat with a list of participants', () => {
        it('should return a new chat instance', (done) => {
            let groupChat = 'hyperty-catalogue://localhost/.well-known/hyperty/GroupChatHyperty'    

            rethink.install({domain: 'localhost', development: true})
                .then((runtime) =>{
                    runtime.requireHyperty(groupChat).then((result) => {
                        result.instance.create('test', [{email: 'openidtest10@gmail.com', domain: 'localhost'}])
                            .then((chat)=>{
                                expect(chat).to.exist
                                done()
                            })
                    }) 
                })
        })

        xit('should notify to all subscribed participants', (done) => {
            let groupChat = 'hyperty-catalogue://localhost/.well-known/hyperty/GroupChatHyperty'    

            rethink.install({domain: 'localhost', development: true})
                .then((runtime) =>{
                    runtime.requireHyperty(groupChat).then((result) => {
                        let guestGroupChat = result
                        guestGroupChat.instance.onInvite((chat)=>{
                            expect(chat).to.exist
                            done()
                        })
                        rethink.install({domain: 'localhost', development: true})
                            .then((runtime) =>{
                                runtime.requireHyperty(groupChat).then((result) => {
                                    result.instance.create('test', [{email: 'openidtest10@gmail.com', domain: 'localhost'}])
                                })
                            })
                    }) 
                })
        })
    })
})
