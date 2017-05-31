/* jshint undef: true */

import {Syncher} from "service-framework/dist/Syncher";
import Discovery from "service-framework/dist/Discovery";
import IdentityManager from "service-framework/dist/IdentityManager";
import {divideURL} from "../utils/utils";
import EventEmitter from "../utils/EventEmitter";
import Logger from "./Logger";

var l = new Logger("ROOMUI");
var roomServerIdentity = "openidtest10@gmail.com";

var autostart = false;

class RoomClient extends EventEmitter {

    /**
     * Create a new RoomClient
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

        // l.test(this); 

        // create Context Schema URL
        this.contextSchemaURL = 'hyperty-catalogue://catalogue.' + divideURL(hypertyURL).domain + '/.well-known/dataschema/Context';

        // discovery stuff
        this.discovery = new Discovery(hypertyURL, configuration.runtimeURL, bus);
        this.identityManager = new IdentityManager(hypertyURL, configuration.runtimeURL, bus);

        // Syncher
        this.syncher = new Syncher(hypertyURL, bus, configuration);

        if (autostart) {
            setTimeout(() => {
                l.d("forcing START with usertoken");
                this.start("usertoken");
            })
        }
    }

    start(token) {
        // this.token = configuration.token;
        this.token = token;
        l.d("token:", this.token);

        // this promise chain represents the complete setup process
        // 1. (a) discover the associated identity and (b) get the URL of the RoomServer hyperty
        // 2. get SyncObject URLs of rooms this identity is allowed to subscribe to from the RoomServer hyperty
        // 3. subscribe to those objects
        this.getRoomServerHypertyURL(roomServerIdentity).then((hypertyURL) => {
            this.roomServerURL = hypertyURL;
            return this.requestRoomURLs(this.token, hypertyURL);
        }).then((urls) => {
            return this.subscribeToRooms(urls)
        }).then((syncRooms) => {
            l.d("Initialization done, room SyncObjects:", syncRooms);
        }).catch((error) => {
            l.e(error);
            this.trigger("error", error);
        });
    }

    /**
     * Discover the identity associated with this hyperty
     * @returns {Promise} - fulfills with the identity this hyperty is associated with
     */
    discoverIdentity() {
        l.d("discoverIdentity");
        return new Promise((resolve, reject) => {
            // first discoverUserRegistered call
            this.identityManager.discoverUserRegistered().then((user) => {
                // if user is an object, it is assumed the discovery succeeded
                if (user instanceof Object) {
                    l.d("discovered user identity:", user);
                    // stop interval if identity is known
                    resolve(user.username); //TODO maybe a different property will be used, take username for now
                } else {
                    let errorString = "discovering user identity should have returned with an object, but instead returned with: " + user;
                    l.w(errorString);
                    throw new Error(errorString);
                }
            }).catch((e) => {
                l.w("discovering user identity failed with:", e);
                l.d("trying discovery again after a timeout");
                // if discovery fails, retry after some timeout
                setTimeout(() => this.discoverIdentity().then(resolve), 500);
            });
        });
    }

    /**
     * Gets the hypertyURL of the RoomServer hyperty
     * @param {string} roomServerURL - identity that the desired RoomServer hyperty is associated to
     * @returns {Promise} - fulfills with the hypertyURL of the RoomServer hyperty
     */
    getRoomServerHypertyURL(roomServerURL) {
        l.d("getRoomServerHypertyURL:", [roomServerURL]);
        return this.discovery.discoverHyperties(roomServerURL).then((hyperties) => {
            l.d("found hyperties: ", hyperties);
            let latestRoomServerHyperty;
            let latestDate;
            let hyperty;
            // iterate through hyperties to find most current RoomServer hyperty
            for (hyperty in hyperties) {
                hyperty = hyperties[hyperty];
                l.d("checking hyperty", hyperty);
                let name = hyperty.descriptor.substring(hyperty.descriptor.lastIndexOf('/') + 1);
                l.d("checking name:", name);
                if (name === "RoomServer") {
                    let date = hyperty.startingTime;
                    l.d("is room server hyperty with startingTime:", date);
                    if (!latestDate || date > latestDate) {
                        l.d("is new latest hyperty:", date);
                        latestDate = date;
                        latestRoomServerHyperty = hyperty;
                    }
                }
            }
            if (latestRoomServerHyperty) {
                return latestRoomServerHyperty.hypertyID;
            } else {
                l.e("Unable to find RoomServer hyperty!");
                throw new Error("Unable to find RoomServer hyperty!");
            }
        });
    }

    /**
     * Subscribes to each SyncObject each URL in the provided array points to
     * @param {Array} urls - array of URLs that point to SyncObjects
     * @returns {Promise} - fulfills with an array of SyncObjects
     */
    subscribeToRooms(urls) {
        l.d("subscribeToRooms:", [urls]);
        let subscribePromises = [];
        urls.forEach((url) => {
            let p = this.subscribe(url);
            subscribePromises.push(p);
        });
        return Promise.all(subscribePromises);
    }

    /**
     * Requests a list of URLs of SyncObjects representing rooms from the desired remote hyperty
     * that the given identity is allowed to monitor & control
     * @param {string} token - token provided to the remote hyperty to decide which URLs it will return (access control)
     * @param {string} remoteHypertyURL - hyperty URL pointing to the remote (RoomServer) hyperty
     * @returns {Promise} - fulfills with an array of SyncObject URLs
     */
    requestRoomURLs(token, remoteHypertyURL) {
        l.d("requestRoomURLs:", [token, remoteHypertyURL]);
        return this.executeOnRemote(remoteHypertyURL, "getRooms", [token]);
    }

    /**
     * invokes a function at the remote hyperty
     * @param {string} remoteHypertyURL - URL of the remote hyperty
     * @param {string} method - name of the function to be invoked
     * @param {Array} params - parameters provided for the remote function
     * @returns {Promise} - fulfills with the result of the remote function call
     */
    executeOnRemote(remoteHypertyURL, method, params) {
        l.d("PRINTING THIS:", this);
        return new Promise((resolve, reject) => {
            if (!remoteHypertyURL || !method) {
                reject("hyperty URL (" + remoteHypertyURL + ") and method (" + method + ") are mandatory!");
                return;
            }
            // create execute message
            let msg = {
                type: 'execute', from: this.hypertyURL, to: remoteHypertyURL,
                body: {method: method, params: params}
            };
            // let msg = this.messageFactory.createExecuteMessageRequest(this.hypertyURL, remoteHypertyURL, method, params);
            // send message, resolve on reply
            l.d("PRINTING THIS AGAIN:", this);
            this.bus.postMessage(msg, (reply) => {
                l.d("got " + method + " reply!", reply);
                if (reply.body.code == 200) {
                    let urls = reply.body.value;
                    resolve(urls);
                } else {
                    l.e("getRooms request rejected (" + reply.body.code + "):", reply.body.value);
                    reject(reply.body.value);
                }
            });
        });
    }

    /**
     * Subscribe to an object using the Syncher
     * @param {string} roomURL - URL of the object
     * @returns {Promise} - Promise that fulfills with the subscribed object
     */
    subscribe(roomURL) {
        l.d("subscribe:", [roomURL]);
        return this.syncher.subscribe(this.contextSchemaURL, roomURL).then((room) => {
            console.info("subscribed to object:", room);

            // register onChange callback
            room.onChange('*', (event) => {
                l.d('onChange received:', event);
                l.d("current room state:", room);
                this.trigger('changedRoom', room.data);
            });

            // trigger the newRoom event
            this.trigger('newRoom', room.data);

            // make it available for addChild test
            this.room = room;
            return room;

        }).catch((reason) => {
            console.error(reason);
        });
    }

    /**
     * executes an action on the RoomServer hyperty
     * @param {string} deviceName - name of the target device, e.g. "myDevice"
     * @param {string} objectType - the type of the target device part that is being controlled, e.g. "light"
     * @param {string} objectId - the ID of the target device's part that is being controlled
     * @param {string} resourceType - the resource that is being changed, e.g. "isOn"
     * @param {*} value - the value that the resource is being changed to
     * @returns {Promise} - fulfills with the result of the remote function call
     */
    sendAction(deviceName, objectType, objectId, resourceType, value) {
        // example: {"mode":"write", "deviceName": "myRaspberry", "objectType": "light", "objectId": "1", "resourceType": "isOn", "value": "false"}
        let json = {
            "mode": "write",
            "deviceName": deviceName,
            "objectType": objectType,
            "objectId": objectId,
            "resourceType": resourceType,
            "value": value
        };
        return this.executeOnRemote(this.roomServerURL, "action", [json]);
    }
}


export default function activate(hypertyURL, bus, configuration) {

    return {
        name: 'RoomClient',
        instance: new RoomClient(hypertyURL, bus, configuration)
    };

}
