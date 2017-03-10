function create(users) {
    console.log('users collection',users)
    function add(profile) {
        return  create(users.concat(profile))
    }

    function query(criteria) {
        return users
    }

    return { add: add, queryUsers: query }    
}

export default function newConnectedUsersCollection() {
    return create([])
}
