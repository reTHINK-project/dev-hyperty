import equal from 'deep-equal'
import s from 'searchjs'

function create(users) {
    function add(profile) {
        if(users.some(v => equal(v, profile)))
            return create(users)

        return  create(users.concat(profile))
    }

    function query(criteria) {
        console.log("query users ", users)
        console.log("with criteria", criteria)
        return s.matchArray(users, criteria)
    }

    return { add: add, query: query }    
}

export default function newQueryableCollection() {
    return create([])
}
