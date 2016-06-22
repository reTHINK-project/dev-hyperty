/* jshint undef: true */

import {Syncher} from 'service-framework/dist/Syncher';
import Discovery from 'service-framework/dist/Discovery';
import HypertyDiscovery from 'service-framework/dist/HypertyDiscovery';
import IdentityManager from 'service-framework/dist/IdentityManager';

import {divideURL} from '../utils/utils';
import EventEmitter from '../utils/EventEmitter';
import Logger from './Logger';

var l = new Logger("ROOMUI");
var roomUIReporterIdentity = "openidtest10@gmail.com";


class RoomUIObserver extends EventEmitter {

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

        // discovery stuff
        this.hypertyDiscovery = new HypertyDiscovery(hypertyURL, bus);
        this.discovery = new Discovery(hypertyURL, bus);
        this.identityManager = new IdentityManager(hypertyURL, configuration.runtimeURL, bus);

        // Syncher
        this.syncher = new Syncher(hypertyURL, bus, configuration);

        // this promise chain represents the complete setup process
        // 1. (a) discover the associated identity and (b) get the URL of the RoomUIReporter hyperty
        // 2. get the SyncObject URLs of rooms this identity is allowed to monitor and control
        // 3. suscribe to those objects
        Promise.all([this.discoverIdentity(), this.getRoomUIReporterHypertyURL(roomUIReporterIdentity)])
            .then(([identity, hypertyURL]) => {
                this.reporterURL = hypertyURL;
                this.identity = identity;
                return this.requestRoomURLs(identity, hypertyURL)
            })
            .then((urls) => {
                return this.subscribeToRooms(urls)
            })
            .then((syncRooms) => {
                l.d("Initialization done, syncObjectRooms:", syncRooms);
            });
    }

    /**
     * Discover the identity associated with this hyperty
     * @returns {Promise} - fulfills with the identity this hyperty is associated with
     */
    discoverIdentity() {
        l.d("discoverIdentity...");
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
     * Gets the hypertyURL of the RoomUIReporter hyperty
     * @param reporterIdentity - identity that the desired RoomUIReporter hyperty is associated to
     * @returns {Promise} - fulfills with the hypertyURL of the RoomUIReporter hyperty
     */
    getRoomUIReporterHypertyURL(reporterIdentity) {
        l.d("getRoomUIReporterHypertyURL:", [reporterIdentity]);
        return this.hypertyDiscovery.discoverHypertiesPerUser(reporterIdentity, null).then((hyperties) => {
            //l.d("found hyperties: ", hyperties);
            let latestRoomReporterHyperty;
            let latestDate;
            // iterate through hyperties to find most current RoomUIReporter hyperty
            for (hyperty in hyperties) {
                hyperty = hyperties[hyperty];
                //l.d("checking hyperty", hyperty);
                let name = hyperty.descriptor.substring(hyperty.descriptor.lastIndexOf('/') + 1);
                //l.d("checking name:", name);
                if (name === "RoomUIReporter") {
                    let date = hyperty.startingTime;
                    //l.d("is room ui reporter with startingTime:", date);
                    if (!latestDate || date > latestDate) {
                        //l.d("is new latest hyperty:", date);
                        latestDate = date;
                        latestRoomReporterHyperty = hyperty;
                    }
                }
            }
            if (latestRoomReporterHyperty) {
                return latestRoomReporterHyperty.hypertyID;
            } else {
                l.e("Unable to find RoomUIReporter hyperty!");
                throw new Error()
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
     * @param {String} identity - identity provided to the remote hyperty to decide which URLs it will return (access control)
     * @param {String} remoteHypertyURL - hyperty URL pointing to the remote (RoomUIReporter) hyperty
     * @returns {Promise} - fulfills with an array of SyncObject URLs
     */
    requestRoomURLs(identity, remoteHypertyURL) {
        l.d("requestRoomURLs:", [identity, remoteHypertyURL]);
        return this.executeOnRemote(remoteHypertyURL, "getRooms", [identity]);
    }

    /**
     * invokes a function at the remote hyperty
     * @param {String} remoteHypertyURL - URL of the remote hyperty
     * @param {String} method - name of the function to be invoked
     * @param {Array} params - parameters provided for the remote function
     * @returns {Promise} - fulfills with the result of the remote function call
     */
    executeOnRemote(remoteHypertyURL, method, params) {
        return new Promise((resolve, reject) => {
            if (!remoteHypertyURL || !method) {
                reject("hyperty URL (" + remoteHypertyURL + ") and method (" + method + ") are mandatory!");
                return;
            }
            // creat execute message
            let msg = {
                type: 'execute', from: this.hypertyURL, to: remoteHypertyURL,
                body: {method: method, params: params}
            };
            // send message, resolve on reply
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
     * @param roomURL - URL of the object
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
                this.trigger('roomChanged', room);
            });

            // trigger the newRoom event
            this.trigger('newRoom', room);

            // make it available for addChild test
            this.room = room;
            return room;

        }).catch(function (reason) {
            console.error(reason);
        });
    }

    /**
     * executes an action on the RoomUIReporter hyperty
     * @param {JSON} json - action payload
     * @returns {Promise} - fulfills with the result of the remote functon call
     */
    sendAction(json) {
        l.d("sendAction:", [json]);
        return this.executeOnRemote(this.reporterURL, "action", [json]);
    }
}


export default function activate(hypertyURL, bus, configuration) {

    return {
        name: 'RoomUIObserver',
        instance: new RoomUIObserver(hypertyURL, bus, configuration)
    };

}
