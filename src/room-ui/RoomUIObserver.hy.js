/* jshint undef: true */

import {Syncher} from 'service-framework/dist/Syncher';
import {divideURL} from '../utils/utils';
import EventEmitter from '../utils/EventEmitter';

class RoomUIObserver extends EventEmitter {

    /**
     * Create a new RoomUIObserver
     * @param  {Syncher} syncher - Syncher provided from the runtime core
     */
    constructor(hypertyURL, bus, configuration) {

        if (!hypertyURL) throw new Error('The hypertyURL is a needed parameter');
        if (!bus) throw new Error('The MiniBus is a needed parameter');
        if (!configuration) throw new Error('The configuration is a needed parameter');

        super();

        let _this = this;
        _this._domain = divideURL(hypertyURL).domain;

        _this._objectDescURL = 'hyperty-catalogue://' + _this._domain + '/.well-known/dataschemas/RoomUIDataSchema';

        let domain = divideURL(hypertyURL).domain;

        console.log("My hyperty URL: ", hypertyURL);
        _this.hypertyURL = hypertyURL;
        let syncher = new Syncher(hypertyURL, bus, configuration);
        syncher.onNotification(function (event) {
            _this._onNotification(event);
        });

        _this._syncher = syncher;
    }

    subscribe(objectURL) {
        let _this = this;
        _this._syncher.subscribe(_this._objectDescURL, objectURL).then(function (roomObjtObserver) {

            console.info("subscribed roomObjtObserver:", roomObjtObserver);


            //roomObjtReporter.onAddChild((child) => {
            //    console.warn("child added:", child);
            //    let childData = child.data ? child.data : child.value;
            //    console.warn("child data:", childData);
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
        let _this = this;
        console.info('Event Received: ', event);
    }

    addChild() {
        let _this = this;
        console.warn("adding child");
        _this.observer.addChild('toggleLight', {"status": "off"});

    }


}


export default function activate(hypertyURL, bus, configuration) {

    return {
        name: 'RoomUIObserver',
        instance: new RoomUIObserver(hypertyURL, bus, configuration)
    };

}
