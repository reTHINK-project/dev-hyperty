/* jshint undef: true */

import {Syncher} from 'service-framework/dist/Syncher';
import Discovery from 'service-framework/dist/Discovery';
import HypertyDiscovery from 'service-framework/dist/HypertyDiscovery';
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

        this._domain = divideURL(hypertyURL).domain;

        // create Object Schema URL
        this._objectDescURL = 'hyperty-catalogue://' + this._domain + '/.well-known/dataschemas/RoomUIDataSchema';

        // make arguments available
        this.hypertyURL = hypertyURL;
        this.bus = bus;
        this.configuration = configuration;

        let hypertyDiscovery = new HypertyDiscovery(hypertyURL, bus);
        let discovery = new Discovery(hypertyURL, bus);

        this.hypertyDiscovery = hypertyDiscovery;
        this.discovery = discovery;

        // identity manager to get user identity for this hyperty
        let identityManager = new IdentityManager(hypertyURL, configuration.runtimeURL, bus);
        identityManager.discoverUserRegistered(hypertyURL).then((userURL) => {
            l.d("got user URL:", userURL);
        });

        let _this = this;

        // syncher
        let syncher = new Syncher(hypertyURL, bus, configuration);
        this._syncher = syncher;
        syncher.onNotification(function (event) {
            _this._onNotification(event);
        });

        // testing discovery with hardcoded user
        let user = "openidtest10@gmail.com";
        l.d("trying to find hyperty of user", user);
        this.hypertyDiscovery.discoverHypertyPerUser(user, null).then(function (foundUser) {
            l.d("found: ", foundUser);
        });


    }

    /**
     * Subscribe to an object using the syncher
     * @param objectURL - URL of the object
     */
    subscribe(objectURL) {
        let _this = this;
        this._syncher.subscribe(_this._objectDescURL, objectURL).then(function (roomObjtObserver) {

            console.info("subscribed roomObjtObserver:", roomObjtObserver);


            //roomObjtReporter.onAddChild((child) => {
            //    l.d("child added:", child);
            //    let childData = child.data ? child.data : child.value;
            //    l.d("child data:", childData);
            //});

            _this.observer = roomObjtObserver;
            roomObjtObserver.onChange('*', function (event) {

                // Hello World Object was changed
                console.info('message received:', event);
                // lets notify the App about the change
                _this.trigger('onChange', event);

            });

        }).catch(function (reason) {
            console.error(reason);
        });
    }

    _onNotification(event) {
        console.info('Event Received: ', event);
    }

    /**
     * Test addChild functionality
     */
    addChild() {
        l.d("adding child");
        this.observer.addChild('toggleLight', {"status": "off"});
    }
}


export default function activate(hypertyURL, bus, configuration) {

    return {
        name: 'RoomUIObserver',
        instance: new RoomUIObserver(hypertyURL, bus, configuration)
    };

}
