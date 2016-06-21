// example Room
let roomJson = {
    "data": [
        {
            "_id": "57690ec61dbc906c2ed8252c",
            "__v": 0,
            "isBooked": false,
            "devices": [],
            "members": [],
            "name": "room1"
        },
        {
            "__v": 0,
            "_id": "57690ec61dbc906c2ed8252d",
            "name": "room3",
            "members": [],
            "devices": [],
            "isBooked": true
        },
        {
            "__v": 1,
            "_id": "57690ec61dbc906c2ed8252b",
            "name": "2012",
            "members": [],
            "isBooked": true,
            "devices": [
                {
                    "name": "myRaspberry",
                    "lastValues": {
                        "misc": [],
                        "light": [
                            {
                                "timestamp": "2016-06-21T09:55:06.553Z",
                                "id": 1,
                                "_id": "57690ef71dbc906c2ed82531",
                                "dimmer": 30,
                                "name": "Desklamp",
                                "isOn": false,
                                "color": {
                                    "value": {
                                        "x": 0.3795,
                                        "y": 0.4598
                                    }
                                }
                            }
                        ],
                        "temperature": [
                            {
                                "_id": "57690efa1dbc906c2ed82532",
                                "timestamp": "2016-06-21T09:55:44.340Z",
                                "unit": "Cel",
                                "id": 0,
                                "value": 25.7
                            }
                        ],
                        "humidity": []
                    },
                    "registration": {
                        "registered": true,
                        "timestamp": "2016-06-21T09:55:03.620Z",
                        "payload": "</3311/1>,</3303/0>"
                    },
                    "__v": 2,
                    "room": "57690ec61dbc906c2ed8252b",
                    "_id": "57690ec61dbc906c2ed8252e"
                }
            ]
        }
    ],
    "error": null
};

export default roomJson;
