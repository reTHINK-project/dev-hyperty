import GroupChatMessage from './GroupChatMessage'
import GroupChatFile from './GroupChatFile'
import { Position, Area } from './gps'
import PeerConnection from './peer-connection'

const GroupChat = {

    sendMessage(message, distance){
        return this.addChild({ type: 'TEXT', message: message, distance: distance, position: this.position, startingTime:Date.now()})
            .then((child)=>{
                this.messages.push(GroupChatMessage(child.data, true, this.identity))
                return this.messages[this.messages.length-1]
            })
    },

    onMessage(callback){
        this.onAddChild((message, identity)=>this._processTextMessages(message, identity, callback))
    },

    _processTextMessages(message, identity, callback){
        if(message.type != 'TEXT')
            return

        let myPosition = Position(this.position)
        let area = Area(message.position, message.distance) 

        if(!myPosition.isIn(area))
            return

        this.messages.push(GroupChatMessage(message, false, identity.userProfile))
        callback(this.messages[this.messages.length-1])
    },

    getContext(){
        return this.messages[this.messages.length-1]?this.messages[this.messages.length-1].text:'' 
    }
}

const One2OneChat = {
    onReceiveMessage(data){
        if (typeof data === 'string') {
            this.buf = parseInt(data)
            return
        }

        this.receiveBuffer.push(data)
        this.receivedSize += data.byteLength

        if (this.receivedSize === this.buf) {
            let received = new window.Blob(this.receiveBuffer)
            this.receiveBuffer = []
            this.receivedSize = 0

            let url = URL.createObjectURL(received)
            this.messages.push(GroupChatFile({ file:url, startingTime:Date.now()}, true, {}))

            this._callback(this.messages[this.messages.length-1])
        }
    },

    sendFile(file){
        this.peer.open()
            .then(connection=>{
                connection.onData(this.onReceiveMessage.bind(this))
                connection.sendData(file.size)
                let chunkSize = 16384
                let sliceFile = (offset)=> {
                    let reader = new window.FileReader()
                    reader.onload = (()=>{
                        return function(e) {
                            connection.sendData(e.target.result)
                            if (file.size > offset + e.target.result.byteLength) {
                                window.setTimeout(sliceFile, 0, offset + chunkSize)
                            }
                        }
                    })(file)
                    var slice = file.slice(offset, offset + chunkSize)
                    reader.readAsArrayBuffer(slice)
                }
                sliceFile(0)
            })
    },

    onMessage(callback){
        this.onAddChild((message, identity)=>{
            this._callback = callback
            this._processTextMessages(message, identity, callback)
            this.peerMessage(message)
        })
    }
}

export default function(id, addChild, onAddChild, { name, startingTime, participants }, position, identity){
    let initialData = {
        id: id,
        name: name,
        startingTime: startingTime,
        messages:[],
        position: position,
        participants: participants,
        identity: identity,
        addChild: addChild,
        onAddChild: onAddChild,
        receiveBuffer: [],
        receivedSize: 0
    }

    if(participants.length === 2){
        let peer = PeerConnection({sendMessage: addChild, onMessage: (callback)=>initialData.peerMessage=(msg)=>callback(msg)})
        let chat = Object.assign(Object.create(GroupChat), One2OneChat, initialData, {peer: peer})

        peer.onConnection((connection)=>{
            connection.onData(chat.onReceiveMessage.bind(chat))
        })

        return chat
    }

    return Object.assign(Object.create(GroupChat), initialData)
}
