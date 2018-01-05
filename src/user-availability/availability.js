export default function() {
    return Object.assign({}, {
        id: '_' + Math.random().toString(36).substr(2, 9),// do we need this?
        values: [{
            name: "availability",
            type: "availability_status",
            unit: "pres",
            value: "available"
        }]
    });
};
