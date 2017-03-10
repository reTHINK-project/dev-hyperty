function create(identityManager, users) {
    console.log('users collection',users)
    function add(hyperty) {
        return identityManager.discoverUserRegistered(undefined, hyperty)
            .then(u => create(identityManager, users.concat(u)))
    }

    function addCollection(hyperties) {
        return Promise.all(hyperties.map(h=>identityManager.discoverUserRegistered(undefined, h).catch(()=>{})))
            .then(u => create(identityManager, users.concat(u.filter(d => d !== undefined))))
    }

    function query(criteria) {
    }

    return { add: add, addCollection: addCollection, queryUsers: query }    
}

export default function newConnectedUsersCollection(identityManager) {
    return create(identityManager, [])
}
