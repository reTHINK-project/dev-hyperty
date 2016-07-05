export default function() {
    return Object.assign({}, {
        schema: "context",
        id: '_' + Math.random().toString(36).substr(2, 9),
        type: "presence",
        time: "0",
        values: [{
            name: "availability",
            unit: "availability",
            value: "unavailable"
        }]
    });
};
