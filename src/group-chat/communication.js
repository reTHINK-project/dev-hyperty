export default function communication(name, url, participants){
    let date = new Date().toJSON()

    return{
        id: name,
        name: name,
        owner: url,
        scheme: 'comm',
        resources: ['chat'],
        children: [],
        startingTime: date,
        lastModified: date,
        duration: '',
        status: 'open',
        participants: participants
    }
}

