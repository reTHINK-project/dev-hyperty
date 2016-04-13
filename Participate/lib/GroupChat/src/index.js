import { Syncher } from 'service-framework/dist/Syncher'

let GroupChat = {
    create: (name) =>{
        return {
            addParticipant(){},
            participants: []
        } 
    },

    onAdd (callback) {
        this.syncher.onNotification((event) =>{
            this.syncher.subscribe(objDescription, event.url)
                .then((dataObject) => {
                    return dataObject
                })
        }) 
    }
}

let groupChatFactory = function(hypertyURL, bus, config){
    let syncher = new Syncher(hypertyURL, bus, config);
    
    return Object.assign(Object.create(GroupChat), { 
            'syncher': syncher 
        })
}

export default function activate(hypertyURL, bus, config){
    return { 
        name: 'Group Chat Hyperty',
        instance: groupChatFactory(hypertyURL, bus, config)
    }
}
