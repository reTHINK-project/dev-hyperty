/* jshint undef: true */

import {Syncher} from 'service-framework/dist/Syncher';
import Discovery from 'service-framework/dist/Discovery';
import IdentityManager from 'service-framework/dist/IdentityManager';
import Logger from './Logger';

import {divideURL} from '../utils/utils';
import roomJson from './roomJson';
import EventEmitter from '../utils/EventEmitter';

var url = "https://localhost:8000";
var l = new Logger("ROOMUI");

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

        l.d("hypertyURL:", hypertyURL);
        l.d("bus:", bus);
        l.d("configuration:", configuration);

        super();

        this._domain = divideURL(hypertyURL).domain;

        // create Object Schema URL
        this._objectDescURL = 'hyperty-catalogue://' + this._domain + '/.well-known/dataschemas/RoomUIDataSchema';

        // make hyperty discoverable
        let discovery = new Discovery(hypertyURL, bus);

        // test identity gathering
        let identityManager = new IdentityManager(hypertyURL, configuration.runtimeURL, bus);
        identityManager.discoverUserRegistered(hypertyURL).then((userURL) => {
            l.d("got user URL:", userURL);
        });

        // make arguments available
        this.hypertyURL = hypertyURL;
        this.bus = bus;
        this.configuration = configuration;

        // make example room available
        this.room = roomJson;

        // list of deviceReporter objects
        this.devices = [];

        // syncher
        let syncher = new Syncher(hypertyURL, bus, configuration);
        this._syncher = syncher;

        // get contexts
        let deviceContexts = this.getDeviceContexts("room1");

        // create deviceReporter object for each context and add it to the 'devices' list
        deviceContexts.forEach((context, i) => {
            l.d("building syncher based on context:", context);
            let _this = this;
            syncher.create(_this._objectDescURL, [hypertyURL], context).then(function (deviceReporter) {
                l.d('device reporter created:', deviceReporter);

                _this.devices[i] = deviceReporter;

                // trigger for GUI (objUrl is the one RoomUIObserver subscribes to)
                _this.trigger('objUrl', deviceReporter._url);

                // react to added children
                deviceReporter.onAddChild((child) => {
                    l.d("onAddChild:", child);
                    let childData = child.data ? child.data : child.value;
                    l.d("child data:", childData);
                    _this.trigger('onAddChild', childData);
                });

                // react to subscription requests
                deviceReporter.onSubscription((event) => {
                    l.d('onSubscription:', event);

                    // accept and trigger
                    event.accept();
                    _this.trigger('onSubscribe', event);
                });
            }).catch(function (reason) {
                console.error(reason);
            });
        });
    }

    /**
     * Modify the ID field of all device reporter objects (to test if subscription works)
     */
    modifyRoom() {
        let rString = Math.random().toString(36).substr(2, 5);
        this.devices.forEach((device, i) => {
            l.d("Setting ID to '" + rString + "' of device:", device);
            device.data.id = rString;
        });
    }

    /**
     * Get the list of devices (JSON) of a room
     * @param {string} roomId - Room ID
     * @returns {Array} devices
     */
    getRawDevices(roomId) {
        l.d("getRawDevices:", roomId);

        //var json = {'room': roomId};
        //var room = this.makeRequest(json).data;

        // For now we use the example room
        var room = this.room.data;
        l.d("got room:", room);

        return room.devices;
    }

    /**
     * Create a Device Context based on a JSON object
     * @param {JSON} device - raw Device in JSON format
     * @returns {{id: *, type: string, values: *[], children: string[]}} context
     */
    createDeviceContext(device) {
        let deviceContext = {
            "id": device._id,
            "type": "LIGHT",
            "values": [
                {
                    "name": device.name,
                    "unit": "someUnit",
                    "value": device,
                    "sum": "someUnit"
                }
            ],
            "children": ["actions", "contexts"]
        };
        return deviceContext;
    }

    /**
     * Get all devices Contexts for a given room
     * @param {string} roomId - Room ID
     * @returns {Array} contexts
     */
    getDeviceContexts(roomId) {
        var devices = this.getRawDevices(roomId);
        var deviceContexts = [];
        devices.forEach((device, i) => {
            deviceContexts[i] = this.createDeviceContext(device);
        });
        return deviceContexts;
    }

    /**
     * Get the raw Device JSON based on ID
     * @param {string} deviceId
     * @returns {JSON} device
     */
    getRawDevice(deviceId) {
        l.d("getRawDevice:", deviceId);

        //var json = {'device': deviceId};
        //var device = this.makeRequest(json).data;

        // For now we use the device of the example room
        var device = this.room.data.devices[0];
        l.d("got device:", device);

        return device;
    }

    /**
     * Makes a POST request with the given payload and returns the response
     * @param {JSON} json - JSON payload for POST request
     * @returns {JSON} response
     */
    makeRequest(json) {
        var xmlHttp = new XMLHttpRequest();
        try {
            xmlHttp.open('POST', url, false); // false for synchronous request
            xmlHttp.send(JSON.stringify(json));
        } catch (e) {
            console.error('request failed: ', e);
            throw e;
        }

        console.log('got response: ' + xmlHttp.responseText);
        var resp = xmlHttp.responseText;

        try {
            resp = JSON.parse(xmlHttp.responseText);
        } catch (e) {
            //console.log('json parsing failed, probably not json:', resp);
        }
        l.d("makeRequest returns:", resp);

        // TODO error handling
        return resp;
    }

}


export default function activate(hypertyURL, bus, configuration) {
    return {
        name: 'RoomUIReporter',
        instance: new RoomUIReporter(hypertyURL, bus, configuration)
    };
}
