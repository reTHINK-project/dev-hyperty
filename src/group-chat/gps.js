let Position = {
    _distance(origin, destination, unit) {
        var radlat1 = Math.PI * origin.latitude/180
        var radlat2 = Math.PI * destination.latitude/180
        var theta = origin.longitude-destination.longitude
        var radtheta = Math.PI * theta/180
        var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta)
        dist = Math.acos(dist)
        dist = dist * 180/Math.PI
        dist = dist * 60 * 1.1515
        if (unit=='K') { dist = dist * 1.609344 }
        if (unit=='N') { dist = dist * 0.8684 }
        return dist
    },

    isIn(area){
        if(!area.radius )
            return true

        return this._distance(area.center, this, 'K')<=area.radius
    }
}

function PositionFactory(positionArray){
    let position = {
        latitude: 0,
        longitude: 0
    }
    
    if(positionArray.values && positionArray.values.forEach )
        positionArray.values.forEach((value)=>position[value.name]=value.value)

    return Object.assign(Object.create(Position), position)
}

let Area = {}

function AreaFactory(center, radius){
    return Object.assign(Object.create(Area), {center: center, radius: radius })
}

export { PositionFactory as Position, AreaFactory as Area }
