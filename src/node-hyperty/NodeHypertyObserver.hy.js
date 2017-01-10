/* jshint undef: true */

// Service Framework
import IdentityManager from 'service-framework/dist/IdentityManager';
import Discovery from 'service-framework/dist/Discovery';
import {Syncher} from 'service-framework/dist/Syncher';
import {divideURL} from '../utils/utils';
import Search from '../utils/Search';

/**
* Hyperty Connector;
* @author Paulo Chainho [paulo-g-chainho@telecom.pt]
* @version 0.1.0
*/
class NodeHypertyObserver {

  /**
  * Create a new HelloWorldReporter
  * @param  {Syncher} syncher - Syncher provided from the runtime core
  */
  constructor(hypertyURL, bus, configuration) {

    if (!hypertyURL) throw new Error('The hypertyURL is a needed parameter');
    if (!bus) throw new Error('The MiniBus is a needed parameter');
    if (!configuration) throw new Error('The configuration is a needed parameter');

    let _this = this;

    let domain = divideURL(hypertyURL).domain;
    _this._domain = domain;
    _this._objectDescURL = 'hyperty-catalogue://catalogue.' + domain + '/.well-known/dataschema/Connection';

    let discovery = new Discovery(hypertyURL, bus);
    let identityManager = new IdentityManager(hypertyURL, configuration.runtimeURL, bus);

    _this.discovery = discovery;
    _this.identityManager = identityManager;

    _this.search = new Search(discovery, identityManager);

    let syncher = new Syncher(hypertyURL, bus, configuration);

    syncher.onNotification((event) => {
      event.ack();

      // this.join(event.url);
    });

    _this.syncher = syncher;
  }

  /**
  * Create HelloWorld Data Object
  * @param  {HypertyURL} HypertyURL - Invited
  */

  join(url) {

    return new Promise((resolve, reject) => {

      this.syncher.subscribe(this._objectDescURL, url).then((dataObjectObserver) => {

        this.currentObject = dataObjectObserver;
        resolve(dataObjectObserver.data);

        dataObjectObserver.onChange('*', (event) => {
          if (this._onChange) this._onChange(event);
        });

      }).catch((reason) => {
        console.log('ERROR:', reason);
        reject(reason);
      });

    });

  }

  disconnect() {
    if (this.currentObject) {
      this.currentObject.unsubscribe();
    }
  }

  onChange(callback) {
    this._onChange = callback;
  }

}



export default function activate(hypertyURL, bus, configuration) {

  return {
    name: 'NodeHypertyObserver',
    instance: new NodeHypertyObserver(hypertyURL, bus, configuration)
  };

}
