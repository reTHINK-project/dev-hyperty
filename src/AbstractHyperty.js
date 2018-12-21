/* jshint undef: true */


/**
* Abstract Hyperty
* @author Paulo Chainho [paulo-g-chainho@alticelabs.com]
* @version 0.1.0
*/
class AbstractHyperty {

  /**
  * Create a new Hyperty
  */
 constructor() {

 }

  _start(hypertyURL, bus, configuration, factory) {

    if (!hypertyURL) throw new Error('The hypertyURL is a needed parameter');
    if (!bus) throw new Error('The MiniBus is a needed parameter');
    if (!configuration) throw new Error('The configuration is a needed parameter');
    if (!factory) throw new Error('The factory is a needed parameter');


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
      // lets now observe any changes done at the Data Object
      console.log('[hyperty syncher resume] - dataObject', resumedObservers);

      Object.values(resumedObservers).forEach((resumedObserver) => {
        _this._processResumedObserver(resumedObserver);
      });

    }).catch((reason) => {
      console.log('[hyperty syncher resume] - ', reason);
    });

    _this._syncher = syncher;
    _this._runtimeHypertyURL = hypertyURL;
  }


/*  get descriptor() {
    return hypertyDescriptor;
  }

  get name(){
    return hypertyDescriptor.name;
  }*/

  get runtimeHypertyURL(){
    return this._runtimeHypertyURL;
  }

  onReporterResume(callback) {
    this._onReporterResume = callback;
  }

  _processResumedObserver(resumedObserver){
    //do something with Resumed Observer
  }  

  // 
  _onNotification(event) {

    let _this = this;

    console.log('[AbstractHyperty._onNotification] Event Received: ', event);

    // Acknowledge reporter about the Invitation was received
    event.ack();

    let input = {
      schema: _this._objectDescURL,
      resource: event.url,
      store: true,
      p2p: false,
      mutual: false
    };
    // Subscribe Invited Data Object
    _this._syncher.subscribe(input).then(function(Observer) {


      // lets now observe any changes done in the subscribed Data Object
      console.log('[AbstractHyperty._onNotification] Object subscribed ', Observer);

      _this._changes(Observer);

    }).catch(function(reason) {
      console.error(reason);
    });
  }

  _changes(dataObject) {

    console.log('[AbstractHyperty._changes ', dataObject);


    dataObject.onChange('*', (event) => {

      // Data Object was changed
      console.log('[AbstractHyperty._changes] new change ', event);

      // do something with change


    });
  }

}
export default AbstractHyperty;

