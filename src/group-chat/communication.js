export default function communication(name, url, participants){
    let date = new Date().toJSON()

    return{
//        name: name,
//        resources: ['chat'],
//        children: [],
        startingTime: date,
        status: 'open',
        participants: participants
    }
}

