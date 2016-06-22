/* jshint undef: true */

import {Syncher} from 'service-framework/dist/Syncher';
import Discovery from 'service-framework/dist/Discovery';
import HypertyDiscovery from 'service-framework/dist/HypertyDiscovery';
import IdentityManager from 'service-framework/dist/IdentityManager';

import {divideURL} from '../utils/utils';
import EventEmitter from '../utils/EventEmitter';
import Logger from './Logger';

var l = new Logger("ROOMUI");

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

        l.d("hypertyURL:", hypertyURL);
        l.d("bus:", bus);
        l.d("configuration:", configuration);

        super();

        this.domain = divideURL(hypertyURL).domain;

        // create Object Schema URL
        this.roomSchemaURL = 'hyperty-catalogue://' + this.domain + '/.well-known/dataschemas/RoomUIDataSchema';

        // make arguments available
        this.hypertyURL = hypertyURL;
        this.bus = bus;
        this.configuration = configuration;

        // discovery stuff
        this.hypertyDiscovery = new HypertyDiscovery(hypertyURL, bus);
        this.discovery = new Discovery(hypertyURL, bus);
        this.identityManager = new IdentityManager(hypertyURL, configuration.runtimeURL, bus);

        // syncher
        let syncher = new Syncher(hypertyURL, bus, configuration);
        this.syncher = syncher;
        syncher.onNotification((event) => {
            l.d('Event Received: ', event);
        });

        // testing discovery with hardcoded user
        let user = "openidtest10@gmail.com";
        l.d("trying to find hyperty of user", user);
        this.hypertyDiscovery.discoverHypertiesPerUser(user, null).then((hyperties) => {
            l.d("found hyperties: ", hyperties);
            let latestRoomReporterHyperty;
            let latestDate;
            // iterate through hyperties to find most current RoomUIReporter hyperty
            for (hyperty in hyperties) {
                hyperty = hyperties[hyperty];
                l.d("checking hyperty", hyperty);
                let name = hyperty.descriptor.substring(hyperty.descriptor.lastIndexOf('/') + 1);
                l.d("checking name:", name);
                if (name === "RoomUIReporter") {
                    let date = hyperty.startingTime;
                    l.d("is room ui reporter with startingTime:", date);
                    if (!latestDate || date > latestDate) {
                        l.d("is new latest hyperty:", date);
                        latestDate = date;
                        latestRoomReporterHyperty = hyperty;
                    }
                }
            }
            l.d("latestRoomReporterHyperty:", latestRoomReporterHyperty);

            // get room object URLs from hyperty using the message bus directly
            let msg = {
                type: 'execute', from: hypertyURL, to: latestRoomReporterHyperty.hypertyID,
                body: {method: "getRooms"}
            };
            bus.postMessage(msg, (reply) => {
                l.d("got getRooms reply!", reply);
                if (reply.body.code == 200) {
                    let urls = reply.body.value;
                    l.d("room URLs:", urls);

                    // subscribe to rooms
                    urls.forEach((url) => {
                        this.subscribe(url);
                    })
                }
            });
        });

        // test identity discovery with timeout
        setTimeout(() => {
            l.d("timeout function invoked, trying to get user identity");
            this.identityManager.discoverUserRegistered(this.hypertyURL).then((userURL) => {
                l.d("got user URL:", userURL);
            });
        }, 5000);
    }

    /**
     * Subscribe to an object using the syncher
     * @param roomURL - URL of the object
     */
    subscribe(roomURL) {
        this.syncher.subscribe(this.roomSchemaURL, roomURL).then((room) => {
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

        }).catch(function (reason) {
            console.error(reason);
        });
    }

    /**
     * Test addChild functionality
     */
    addChild() {
        // just something to attach to the room
        let action = {
            "id": "someID",
            "type": "someType",
            "values": [{
                "name": "setBrightness",
                "unit": "someUnit",
                "value": {
                    "brightness": 75
                },
                "sum": "whatever"
            }]
        };

        l.d("adding to child:", action);

        this.room.addChild('actions', action);
    }
}


export default function activate(hypertyURL, bus, configuration) {

    return {
        name: 'RoomUIObserver',
        instance: new RoomUIObserver(hypertyURL, bus, configuration)
    };

}
