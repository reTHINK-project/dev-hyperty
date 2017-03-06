/* jshint undef: true */
import IdentityManager from 'service-framework/dist/IdentityManager';
import Discovery from 'service-framework/dist/Discovery';
import {Syncher} from 'service-framework/dist/Syncher';
import {divideURL} from '../utils/utils';

class DiscoveryHyperty { 

    constructor(hypertyURL, bus, configuration) {
        if (!hypertyURL) throw new Error('The hypertyURL is a needed parameter');
        if (!bus) throw new Error('The MiniBus is a needed parameter');
        if (!configuration) throw new Error('The configuration is a needed parameter');

        console.log('[DiscoveryHyperty]', hypertyURL)
        this._domain = divideURL(hypertyURL).domain;
        this._objectDescURL = 'hyperty-catalogue://catalogue.' + this._domain + '/.well-known/dataschema/Context';
        this._syncher = new Syncher(hypertyURL, bus, configuration);
        this._discovery = new Discovery(hypertyURL, bus);
        this._identityManager = new IdentityManager(hypertyURL, configuration.runtimeURL, bus);

        // receiving starts here
        this._syncher.onNotification((event) => {
            console.log('[DiscoveryHy MSG]', event)
            this._onNotification(event);
        });
        this._notify()
    }

    onUserListChanged(callback) {
        this._newUser = callback
    }

    queryUsers(criteria) {
        return new Promise((resolve)=>resolve(this._users))
    }

    _onNotification(event) {
        if(!event.schema.endsWith('Context') || event.value.name !== 'discovery')
            return

        switch (event.type) {
            case "create":
                this._syncher.subscribe(this._objectDescURL, event.url).then((objObserver) => {
                    this._users.push(event.from)
                    this._newUser()
                }).catch((reason) => {
                    console.error(reason);
                });
                break;
            case "delete":
                //TODO
                break;
        }
    }

    _notify(hypertyURL) {
        return this._discovery.discoverDataObject('discovery', ['context'], ["users"])
            .then((h) => this._createSyncher(Object.keys(h).map(k=>h[k].reporter)))
            .catch((err)=>{
                console.error('[DiscoveryHyperty]', err)
            })
    }

    _createSyncher(hyperties) {
        let dataObject = {
            schema: "context",
            id: '_' + Math.random().toString(36).substr(2, 9),
            type: "presence",
            time: "0",
            name: "discovery",
            resources: ["users"]
        }
        this._users = hyperties
        this._syncher.create(this._objectDescURL, hyperties, dataObject).then((objReporter) => {
            console.log('[DiscoveryHy _syncher created]', hyperties)
            objReporter.onSubscription(function(event) {
                event.accept(); // all subscription requested are accepted
            });
        })
        .catch(function(reason) {
            console.error(reason);
        });
    }
}


export default function activate(hypertyURL, bus, configuration) {
    return {
        name: 'Discovery',
        instance: new DiscoveryHyperty(hypertyURL, bus, configuration)
    };
}
