import { expect } from 'chai'
import GroupChat from '../src/group-chat/GroupChat'

describe('GroupChatFactory', ()=>{
    it('should return a object with SendData capabilities if there are two participants', ()=>{
        let groupChat = GroupChat('id', ()=>{}, ()=>{}, 
                {name: '', startingTime: Date.now(), participants: ['p1', 'p2']}, {}, {})
        
        expect(groupChat.sendFile).to.be.defined
    })
})
