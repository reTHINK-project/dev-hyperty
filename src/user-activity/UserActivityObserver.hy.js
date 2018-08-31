//import { Syncher } from 'service-framework/dist/Syncher';
import URI from 'urijs';
//import Search from '../utils/Search';
//import IdentityManager from 'service-framework/dist/IdentityManager';
//import { Discovery } from 'service-framework/dist/Discovery';
//import { ContextObserver } from 'service-framework/dist/ContextManager';


/**
 * The User Activity Hyperty provides an API to the Application to discover and connect to sources of user activity data.
 * These functions are only required to be used once.
 * By default, the Hyperty automatically connects and starts reading sources that were connected the last time.
 */
class UserActivityObserver {

  constructor(hypertyURL, bus, config, factory) {
//    super(hypertyURL, bus, config, ['availability_context'], factory);
    this._context = factory.createContextObserver(hypertyURL, bus, config,['availability_context']);

    let uri = new URI(hypertyURL);

    this.objectDescURL = `hyperty-catalogue://catalogue.${uri.hostname()}/.well-known/dataschema/Context`;
//    this.syncher = factory.createSyncher(hypertyURL, bus, config);
    this.identityManager = factory.createIdentityManager(hypertyURL, config.runtimeURL, bus);
    this.discovery = factory.createDiscovery(hypertyURL, config.runtimeURL, bus);
    this.search = factory.createSearch(this.discovery, this.identityManager);
    this.bus = bus;
    this.hypertyURL = hypertyURL;
    bus.addListener(hypertyURL, (msg) => {
      console.log('[UserActivityObserver] new msg', msg);
    });
    this.callback = null;
  }

  /**
   * This function discovers available user activity sources.
   * <Promise> Context.Context[] discover()
   *
   *  A list of Context objects is returned as a Promise. Each Context object contains:
      context.id : source id e.g. google fit api endpoint
      context.name : name of the source eg Google FIT
      context.description : additional information about the source (optional)
   */
  discover() {

    return new Promise((resolve, reject) => {
      let contexts = [];
      const context = {
        id: '1',
        name: 'Google FIT',
        description: 'no more additional info'
      };
      contexts.push(context);
      resolve(contexts);
    });

  }

  /**
  * This function connects to a certain previously discovered user activity source and starts reading it.
  * <Promise> Context connect( string id, options ?options )
  * - id source identity returned by the discover function ie context.id
  * - options is of type Options where measurement frequency is defined (is it required?).
  */
  connect(id, options) {


    return new Promise((resolve, reject) => {
      // returns as a promise the subscribed User Activity Context Data Object.
      resolve(true);
    });


  }



  start(callback, identity) {
    let _this = this;
    _this.callback = callback;
    // get GFit access token (token received by protostub)
    _this.bus.postMessage({
      type: 'create',
      from: _this.hypertyURL,
      to: 'fitness://sharinglisboa@google.com',
      body: {

        value: {
          resources: ['user_activity_context']
        }
      }
    }, (reply) => {
      if (reply.body.code === 200) {
        console.log('[UserActivityObserver] GFit auth granted');
        console.log(_this);
        let googleStubUrlStatus = reply.body.runtimeURL + '/status'
        console.log('[UserActivityObserver] listener added on ', googleStubUrlStatus);
        _this.bus.addListener(googleStubUrlStatus, newMsg => {
          console.log('[UserActivityObserver] googleStatusChanged', newMsg);
          if (newMsg.hasOwnProperty('body') && newMsg.body.hasOwnProperty('desc') && newMsg.body.desc.hasOwnProperty('error') ){
            callback(newMsg.body.desc.error);
          }

        });
        callback(true);
      } else {
        console.log('[UserActivityObserver] GFit auth not granted');
        callback(false);
      }
    });


    // call runtimeUAstub authorise

    /*
        // send user profile
        debugger;
        const stubURL = 'runtime://fitness.google.com/user-activity';
        let createMessage = {
          type: 'forward', to: stubURL, from: _this.hypertyURL,
          identity: { userProfile: { userURL: identity.userURL } },
          body: {
            type: 'create',
            from: _this.hypertyURL
          }
        };
        _this.bus.postMessage(createMessage);*/
  }


  /*
    Stop GoogleProtoStub from querying sessions.
  */
  stop() {
    let _this = this;

    _this.bus.postMessage({
      type: 'delete',
      from: _this.hypertyURL,
      to: 'fitness://sharinglisboa@google.com',
      body: {
        value: {
          resources: ['user_activity_context']
        }
      }
    }, (reply) => {
      if (reply.body.code === 200) {
      } else {
      }
    });
  }

}
export default function activate(hypertyURL, bus, config, factory) {
  return {
    name: 'UserActivityObserver',
    instance: new UserActivityObserver(hypertyURL, bus, config, factory)
  };
}
