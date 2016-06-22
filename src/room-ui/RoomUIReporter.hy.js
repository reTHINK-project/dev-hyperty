/* jshint undef: true */

import {Syncher} from 'service-framework/dist/Syncher';
import Discovery from 'service-framework/dist/Discovery';
import IdentityManager from 'service-framework/dist/IdentityManager';
import Logger from './Logger';

import {divideURL} from '../utils/utils';
import roomJson from './roomJson';
import EventEmitter from '../utils/EventEmitter';

var l = new Logger("ROOMUI");

var url = "https://praxis:8000";
var useExampleRoomJson = true;

class RoomUIReporter extends EventEmitter {

    /**
     * Create a new RoomUIReporter
     * @param {string} hypertyURL - URL of the hyperty
     * @param {MiniBus} bus - MiniBus
     * @param {Object} configuration - configuration of hyperty
     */
    constructor(hypertyURL, bus, configuration) {

        if (!hypertyURL) throw new Error('The hypertyURL is a needed parameter');
        if (!bus) throw new Error('The MiniBus is a needed parameter');
        if (!configuration) throw new Error('The configuration is a needed parameter');

        super();

        l.d("hypertyURL:", hypertyURL);
        l.d("bus:", bus);
        l.d("configuration:", configuration);

        // make parameters available
        this.hypertyURL = hypertyURL;
        this.bus = bus;
        this.configuration = configuration;

        // create Context Schema URL
        this.contextSchemaURL = 'hyperty-catalogue://' + divideURL(hypertyURL).domain + '/.well-known/dataschema/Context';

        // make hyperty discoverable
        this.discovery = new Discovery(hypertyURL, bus);

        // syncher
        this.syncher = new Syncher(hypertyURL, bus, configuration);

        // set up the rooms
        this.setUpRooms().then((roomSyncObjects) => {
            l.d("setUpdRooms done, objects:", roomSyncObjects);

            let roomMap = {};
            roomSyncObjects.forEach((roomSyncObject) => {
                l.d("adding room map:", roomSyncObject.data.name);
                roomMap[roomSyncObject.data.name] = roomSyncObject
            });
            this.roomMap = roomMap;

            l.d("triggering roomMap");
            this.trigger('roomMap', roomMap);

        });

        // listen for getRooms execution message
        l.d("Setting up bus listener for getRooms()...");
        bus.addListener(hypertyURL, (msg) => {
            if (msg.type === "execute" && msg.body.method === "getRooms") {
                l.d("got execute message:", msg);
                let identity;
                try {
                    identity = msg.body.params[0];
                } catch (e) {
                    l.w("getRooms called remotely, but no identity was provided!");
                }

                let list = this.getRooms(identity);

                bus.postMessage({
                    id: msg.id,
                    type: "response",
                    from: msg.to,
                    to: msg.from,
                    body: {code: 200, value: list}
                });
            }
        });
    }

    /**
     * function to test syncObject manipulation and its corresponding callbacks
     * @param roomNr
     */
    modifyRoom(roomNr) {
        let values = this.roomMap[roomNr].data.values;
        let val = values[0];
        val.name = "someOtherName";
        values[0] = val;
        this.roomMap[roomNr].data.values = values;
    }

    /**
     * Returns a list of object URLs for rooms a certain user can subscribe to
     * @param {String} user - user identity that is associated to the requesting hyperty
     * @returns {Array} - list of object URLs
     */
    getRooms(user) {
        let urls = [];
        // iterate through rooms and extract their URLs
        for (room in this.roomMap) {
            // TODO: check member array for having user in it
            urls.push(this.roomMap[room].url);
        }
        l.d("getRooms returns:", urls);
        return urls;
    }

    /**
     * Requests the room list from the LWM2M server and sets up the syncObjects that represent them
     * @returns {Promise} - Promise that returns the array of rooms as SyncObjects
     */
    setUpRooms() {
        l.d("setUpRooms...");
        if (useExampleRoomJson) {
            l.d("setUpRooms uses roomJson:", roomJson);
            return this.setUpRoomSyncherObjects(roomJson.data);
        } else {
            let json = {"mode": "read", "room": null};
            return this.makeRequest(json).then((respJson) => {
                return this.setUpRoomSyncherObjects(respJson.data)
            });
        }
    }

    /**
     * Sets up the syncher objects that represent rooms included in this json
     * @param {Array} roomArray - array of room objects as received from LWM2MServer
     * @returns {Promise} - Promise that returns the array of rooms as SyncObjects
     */
    setUpRoomSyncherObjects(roomArray) {
        l.d("setting up room syncher objects based on:", roomArray);
        let contexts = [];
        roomArray.forEach((room) => {
            contexts.push(this.createRoomContext(room))
        });
        l.d("context JSONs created:", contexts);

        let promises = [];
        contexts.forEach((roomContext) => {
            l.d("creating syncher object for:", roomContext);
            promises.push(this.syncher.create(this.contextSchemaURL, [this.hypertyURL], roomContext).then(function (synchRoom) {
                l.d('room reporter for room ' + roomContext.name + ' created:', synchRoom);

                // react to added children
                synchRoom.onAddChild((child) => {
                    l.d("onAddChild:", child);
                    let childData = child.data ? child.data : child.value;
                    l.d("child data:", childData);
                });

                // react to subscription requests
                synchRoom.onSubscription((event) => {
                    l.d('onSubscription:', event);

                    // accept
                    event.accept();
                });

                return synchRoom;
            }));
        });

        return Promise.all(promises).then((synchObjects) => {
            l.d("all promises done: ", synchObjects);
            return synchObjects;
        });
    }

    /**
     * Create Context JSON based on the json of a room
     * @param {JSON} roomJson - room object as received from LWM2MServer
     * @returns {JSON} - room Context JSON
     */
    createRoomContext(roomJson) {
        l.d("creating room context JSON based on:", roomJson);
        let context = {
            "id": roomJson._id,
            "name": roomJson.name,
            "values": []
        };

        roomJson.devices.forEach((device, i) => {
            context.values.push({
                "name": device.name, //TODO: use ID
                "value": device
            })
        });

        return context;
    }

    /**
     * Makes a POST request to the remote LWM2MServer with the given payload and returns the response
     * @param json - JSON Payload
     * @returns {Promise} - Promise that fulfills with parsed JSON response
     */
    makeRequest(json) {
        return new Promise((resolve, reject) => {
            var xmlHttp = new XMLHttpRequest();
            xmlHttp.open('POST', url, true);

            xmlHttp.onload = (e) => {
                if (xmlHttp.readyState === 4) {
                    if (xmlHttp.status === 200) {
                        try {
                            resolve(JSON.parse(xmlHttp.responseText));
                        } catch (e) {
                            l.e("json parsing failed! raw:", xmlHttp.responseText);
                            l.e(e);
                            reject(e);
                        }
                    } else {
                        l.e("Unsuccessful request:", xmlHttp.statusText);
                        reject(xmlHttp.statusText);
                    }
                }
            };

            xmlHttp.send(JSON.stringify(json));
        });
    }


}


export default function activate(hypertyURL, bus, configuration) {
    return {
        name: 'RoomUIReporter',
        instance: new RoomUIReporter(hypertyURL, bus, configuration)
    };
}
