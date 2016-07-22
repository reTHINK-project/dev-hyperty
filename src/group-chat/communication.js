export default function communication(name, participants){
    return{
        id:'',
        name: name,
        owner: '',
        scheme: 'comm',
        startingTime: '',
        lastModified: '',
        duration: '',
        status: '',
        qos: '',
        participants: participants
    }
}

