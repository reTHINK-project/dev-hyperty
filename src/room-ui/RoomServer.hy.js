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

class RoomServer {

    /**
     * Create a new RoomServer
     * @param {string} hypertyURL - URL of the hyperty
     * @param {MiniBus} bus - MiniBus
     * @param {Object} configuration - configuration of hyperty
     */
    constructor(hypertyURL, bus, configuration) {

        if (!hypertyURL) throw new Error('The hypertyURL is a needed parameter');
        if (!bus) throw new Error('The MiniBus is a needed parameter');
        if (!configuration) throw new Error('The configuration is a needed parameter');

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

        // 1. set up the rooms
        // 2. add them to roomMap
        // 3. trigger roomMap event
        this.setUpRooms().then((roomSyncObjects) => {
            l.d("setUpdRooms done, objects:", roomSyncObjects);

            let roomMap = {};
            roomSyncObjects.forEach((roomSyncObject) => {
                l.d("adding to room map:", roomSyncObject.data.name);
                roomMap[roomSyncObject.data.name] = roomSyncObject
            });
            this.roomMap = roomMap;
        });

        l.d("Setting up functions for remote");
        this.setupRemoteFunctionCallAbility();
        this.addFunctionForRemote(this.getRooms);
        this.addFunctionForRemote(this.makeRequest, "action");
    }

    /**
     * Adds a listener on the message bus to handle execute messages,
     * and checks if the requested function has been added with {@link addFunctionForRemote}.
     */
    setupRemoteFunctionCallAbility() {
        l.d("setupRemoteFunctionCallAbility");

        // create function holder
        this.remoteFunctions = {};

        //add listener
        this.bus.addListener(this.hypertyURL, (msg) => {
            // we are only interested in execute messages
            if (msg.type === "execute") {
                l.d("got execute message:", msg);
                let func = this.remoteFunctions[msg.body.method];

                // a function that was added with addFunctionForRemote was found
                if (func) {
                    l.d("function " + func.name + " is being called remotely");
                    try {
                        // call function with provided parameters
                        let result = func.apply(this, msg.body.params);

                        // handle promise differently, i.e. respond with the result of the promise
                        if (result instanceof Promise) {
                            result.then((realResult) => {
                                l.d("function " + func.name + " returned returned a promise, which fulfilled with:", result);
                                this.sendResponse(msg, realResult);
                            }).catch((error) => {
                                l.w("function call failed: ", error);
                                this.sendResponse(msg, error, 500);
                            })
                        } else {
                            l.d("function " + func.name + " returned:", result);
                            this.sendResponse(msg, result);
                        }
                    } catch (e) {
                        l.w("invoking function " + func.name + " with parameters " + msg.body.params + " failed:", e);
                        this.sendResponse(msg, e, 500);
                    }
                } else {
                    l.w("remote endpoint requested function call " + msg.body.method + " but it is not set up.");
                    this.sendResponse(msg, "Function " + msg.body.method + " does not exist", 400);
                }
            }
        });
    }

    /**
     * Add a function to be callable by remote endpoints
     * @param {function} func - function to be called
     * @param {string} [name] - alias for the function that the remote endpoint uses
     */
    addFunctionForRemote(func, name = func.name) {
        l.d("addFunctionForRemote:", arguments);
        if (!this.remoteFunctions) {
            throw new Error("Call setupRemoteFunctionCallAbility() first!");
        }
        this.remoteFunctions[name] = func;
    }

    /**
     * Send a response for the given request.
     * @param {Object} requestMsg  - original request message that is being responded to
     * @param {Object} requestMsg.id  - id of the original message
     * @param {Object} requestMsg.to  - where the original message was sent to (i.e. here)
     * @param {Object} requestMsg.from  - where the original message was coming from
     * @param {*} response - the response payload
     * @param {number} [code] - optional response code
     */
    sendResponse(requestMsg, response, code = 200) {
        l.d("sendResponse:", arguments);
        this.bus.postMessage({
            id: requestMsg.id,
            type: "response",
            from: requestMsg.to,
            to: requestMsg.from,
            body: {code: code, value: response}
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
        l.d("getRoooms:", arguments);
        let urls = [];
        // iterate through rooms and extract their URLs
        l.d("iterating through rooms:", this.roomMap);
        let room;
        for (room in this.roomMap) {
            // TODO: check member array for having user in it
            urls.push(this.roomMap[room].url);
        }
        return urls;
    }

    /**
     * Requests the room list from the LWM2M server and sets up the syncObjects that represent them
     * @returns {Promise} - Promise that returns the array of rooms as SyncObjects
     */
    setUpRooms() {
        l.d("setUpRooms");
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
        l.d("setUpRoomSyncherObjects:", arguments);
        let contexts = [];
        roomArray.forEach((room) => {
            contexts.push(this.createRoomContext(room))
        });
        l.d("context JSONs created:", contexts);

        let promises = [];
        contexts.forEach((roomContext) => {
            l.d("creating syncher object for:", roomContext);
            promises.push(this.syncher.create(this.contextSchemaURL, [this.hypertyURL], roomContext).then(function (synchRoom) {
                l.d('SyncObject for room ' + roomContext.name + ' created:', synchRoom);

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
     * @param {Object} roomJson - room object as received from LWM2MServer
     * @param {Object[]} roomJson.devices - devices of the room
     * @param {string} roomJson.name - name of the room
     * @param {string} roomJson._id - ID of the room
     * @returns {Object} - room Context JSON
     */
    createRoomContext(roomJson) {
        l.d("createRoomContext:", arguments);
        let context = {
            "id": roomJson._id,
            "name": roomJson.name,
            "values": [],
            "scheme": "context",
            "type": "chat"
        };

        roomJson.devices.forEach((device) => {
            context.values.push({
                "name": device.name, //TODO: use ID
                "value": device
            })
        });

        return context;
    }

    /**
     * Makes a POST request to the remote LWM2MServer with the given payload and returns the response
     * @param {Object} json - JSON Payload
     * @returns {Promise} - Promise that fulfills with parsed JSON response
     */
    makeRequest(json) {
        return new Promise((resolve, reject) => {
            var xmlHttp = new XMLHttpRequest();
            xmlHttp.open('POST', url, true);

            xmlHttp.onload = () => {
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

            xmlHttp.onerror = (e) => {
                reject("Unable to send request. Status: " + e.target.status);
            };

            xmlHttp.send(JSON.stringify(json));
        });
    }


}


export default function activate(hypertyURL, bus, configuration) {
    return {
        name: 'RoomServer',
        instance: new RoomServer(hypertyURL, bus, configuration)
    };
}