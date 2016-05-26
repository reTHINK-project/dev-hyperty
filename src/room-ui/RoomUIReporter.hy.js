/* jshint undef: true */

import {Syncher} from 'service-framework/Syncher';
import {divideURL} from '../utils/utils';
import roomJson from './roomJson';
import EventEmitter from '../utils/EventEmitter';

var url = "https://localhost:8000";

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

        let _this = this;
        _this._domain = divideURL(hypertyURL).domain;

        // create Object Schema URL
        _this._objectDescURL = 'hyperty-catalogue://' + _this._domain + '/.well-known/dataschemas/RoomUIDataSchema';

        // make arguments available
        _this.hypertyURL = hypertyURL;
        _this.bus = bus;
        _this.configuration = configuration;

        // make example room available
        _this.room = roomJson;

        // list of deviceReporter objects
        _this.devices = [];

        let syncher = new Syncher(hypertyURL, bus, configuration);
        _this._syncher = syncher;

        // get contexts
        let deviceContexts = _this.getDeviceContexts("room1");

        // create deviceReporter object for each context and add it to the 'devices' list
        deviceContexts.forEach((context, i) => {
            console.warn("ROOOMUI building syncher based on context:", context);

            syncher.create(_this._objectDescURL, [hypertyURL], context).then(function (deviceReporter) {
                console.warn('ROOMUI device reporter created:', deviceReporter);

                _this.devices[i] = deviceReporter;

                // trigger for GUI (objUrl is the one RoomUIObserver subscribes to)
                _this.trigger('objUrl', deviceReporter._url);

                // react to added children
                deviceReporter.onAddChild((child) => {
                    console.warn("ROOMUI onAddChild:", child);
                    let childData = child.data ? child.data : child.value;
                    console.warn("ROOMUI child data:", childData);
                });

                // react to subscription requests
                deviceReporter.onSubscription((event) => {
                    console.warn('ROOMUI onSubscription:', event);

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
     * Modify the ID field of all device repoter objects (to test if subscription works)
     */
    modifyRoom() {
        let _this = this;
        let rString = Math.random().toString(36).substr(2, 5);
        _this.devices.forEach((device, i) => {
            console.warn("ROOMUI: Setting ID to '" + rString + "' of device:", device);
            device.data.id = rString;
        });
    }

    /**
     * Get the list of devices (JSON) of a room
     * @param {string} roomId - Room ID
     * @returns {Array} devices
     */
    getRawDevices(roomId) {
        console.warn("ROOMUI getRawDevices:", roomId);
        let _this = this;

        //var json = {'room': roomId};
        //var room = _this.makeRequest(json).data;

        // For now we use the example room
        var room = _this.room.data;
        console.warn("ROOMUI got room:", room);

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
        let _this = this;
        var devices = _this.getRawDevices(roomId);
        var deviceContexts = [];
        devices.forEach((device, i) => {
            deviceContexts[i] = _this.createDeviceContext(device);
        });
        return deviceContexts;
    }

    /**
     * Get the raw Device JSON based on ID
     * @param {string} deviceId
     * @returns {JSON} device
     */
    getRawDevice(deviceId) {
        console.warn("ROOMUI getRawDevice:", deviceId);
        let _this = this;

        //var json = {'device': deviceId};
        //var device = _this.makeRequest(json).data;

        // For now we use the device of the example room
        var device = _this.room.data.devices[0];
        console.warn("ROOMUI got device:", device);

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
            return;
        }

        console.log('got response: ' + xmlHttp.responseText);
        var resp = xmlHttp.responseText;

        try {
            resp = JSON.parse(xmlHttp.responseText);
        } catch (e) {
            //console.log('json parsing failed, probably not json:', resp);
        }
        console.warn("ROOMUI makeRequest returns:", resp);

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
