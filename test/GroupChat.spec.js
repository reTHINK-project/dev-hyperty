import { expect } from 'chai'
import GroupChat from '../src/group-chat/GroupChat'

describe('GroupChatFactory', ()=>{
    it('should return a GroupChat if there are more than two participants', ()=>{
        let groupChat = GroupChat('id', ()=>{}, ()=>{}, 
                {name: '', startingTime: Date.now(), participants: ['p1', 'p2', 'p3']}, {}, {})
        
        expect(groupChat.sendFile).to.be.undefined
    })

    it('should return a One2OneChat if there are two participants', ()=>{
        let groupChat = GroupChat('id', ()=>{}, ()=>{}, 
                {name: '', startingTime: Date.now(), participants: ['p1', 'p2']}, {}, {})
        
        expect(groupChat.sendFile).to.be.defined
    })
})

describe('One2OneChat', ()=>{
    describe('sendFile', ()=>{
        xit('should send a file to a participant', ()=>{
        })
    })
})
