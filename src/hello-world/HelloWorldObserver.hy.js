/* jshint undef: true */

// import {Syncher} from 'service-framework/dist/Syncher';
// import {divideURL} from '../utils/utils';
import EventEmitter from '../utils/EventEmitter';

/**
* Hello World Observer
* @author Paulo Chainho [paulo-g-chainho@telecom.pt]
* @version 0.1.0
*/
class HelloWorldObserver extends EventEmitter {

  /**
  * Create a new HelloWorldObserver
  * @param  {Syncher} syncher - Syncher provided from the runtime core
  */
  constructor(hypertyURL, bus, configuration, factory) {

    if (!hypertyURL) throw new Error('The hypertyURL is a needed parameter');
    if (!bus) throw new Error('The MiniBus is a needed parameter');
    if (!configuration) throw new Error('The configuration is a needed parameter');
    if (!factory) throw new Error('The factory is a needed parameter');

    super();

    let _this = this;
    let domain = factory.divideURL(hypertyURL).domain;
    _this._domain = domain;

    _this._objectDescURL = 'hyperty-catalogue://catalogue.' + domain + '/.well-known/dataschema/HelloWorldDataSchema';

    let syncher = factory.createSyncher(hypertyURL, bus, configuration);
    syncher.onNotification(function(event) {
      _this._onNotification(event);
    });

    syncher.resumeObservers({}).then((resumedObservers) => {

      if (!resumedObservers) return;
      // lets now observe any changes done in Hello World Object
      console.log('[hyperty syncher resume] - dataObject', resumedObservers);

      Object.values(resumedObservers).forEach((helloObjtObserver) => {
        _this._changes(helloObjtObserver);
        helloObjtObserver.sync();
      })

    }).catch((reason) => {
      console.log('[hyperty syncher resume] - ', reason);
    });

    _this._syncher = syncher;
  }

  _onNotification(event) {

    let _this = this;

    console.info('Event Received: ', event);

    _this.trigger('invitation', event.identity);

    // Acknowledge reporter about the Invitation was received
    event.ack();

    let input = {
      schema: _this._objectDescURL,
      resource: event.url,
      store: true,
      p2p: false
    };
    // Subscribe Hello World Object
    _this._syncher.subscribe(input).then(function(helloObjtObserver) {

      // Hello World Object was subscribed
      console.info(helloObjtObserver);

      // lets now observe any changes done in Hello World Object
      console.log('[hyperty syncher subscribe] - dataObject', helloObjtObserver);

      _this._changes(helloObjtObserver);

    }).catch(function(reason) {
      console.error(reason);
    });
  }

  _changes(dataObject) {

    console.log('[hyperty syncher] - dataObject', dataObject);

    // lets notify the App the subscription was accepted with the mnost updated version of Hello World Object
    this.trigger('hello', dataObject.data);

    dataObject.onChange('*', (event) => {

      // Hello World Object was changed
      console.info('message received:', event);

      if (event.field === 'hello') {
        // lets notify the App about the change
        this.trigger('hello', dataObject.data);
      }

    });
  }

}

export default function activate(hypertyURL, bus, configuration, factory) {

  return {
    name: 'HelloWorldObserver',
    instance: new HelloWorldObserver(hypertyURL, bus, configuration, factory)
  };

}
