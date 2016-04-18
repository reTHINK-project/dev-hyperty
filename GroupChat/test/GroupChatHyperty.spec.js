import { assert } from 'chai'
import rethink from './resources/.well-known/runtime/rethink'

describe('Group Chat Hyperty', () => {
    describe('create chat', () => {
        xit('should return a new chat instance', (done) => {
        })
    })

    describe('create chat with a list of participants', () => {
        it('should return a new chat instance', (done) => {
            let domain = 'localhost'
            let groupChat = 'hyperty-catalogue://localhost/.well-known/hyperty/GroupChatHyperty'    

            rethink.install(domain)
                .then((runtime) =>{
                    runtime.requireHyperty(groupChat).then((result) => {
                        let groupChat_creator = result.instance
                        
                        rethink.install(domain)
                            .then((runtime) => {
                                runtime.requireHyperty(groupChat).then((result) => {
                                    let groupChat_guest = result.instance
                                    groupChat_guest.onAdd((observer) => {
                                        done()
                                    })
                                    let chat = groupChat_creator.create('test', ['openidtest10@gmail.com'])
                            })
                        }) 
                    }) 
                })
        })
    })
})
