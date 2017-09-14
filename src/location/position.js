let LocationObject = {}

function getId(){
  return '_' + Math.random().toString(36).substr(2, 9);
}

export default function PositionFactory(){
    return Object.assign({}, {
        schema: "context",
        id: getId(),
        type: "location",
        time: "0",
        values: [
            {
                name: "latitude",
                unit: "lat",
                value: 0
            },
            {
                name: "longitude",
                unit: "lat",
                value: 0
            }

        ]    
    })
}
