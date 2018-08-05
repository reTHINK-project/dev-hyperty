//import IdentityManager from 'service-framework/dist/IdentityManager';
//import {Syncher} from 'service-framework/dist/Syncher';
//import {Discovery} from 'service-framework/dist/Discovery';
import {ContextObserver} from 'service-framework/dist/ContextManager';
//import {divideURL} from '../utils/utils';
//import Search from '../utils/Search';
//import EventEmitter from '../utils/EventEmitter';

class UserKwhObserver extends ContextObserver {

  constructor(hypertyURL, bus, configuration, factory) {

    super(hypertyURL, bus, configuration, ['availability_context'], factory);

  }


  start() {
    let resumedCallback = (availability) => {
      console.log('[UserKwhObserver.onDisconnected]: ', availability);

      availability.data.values[0].value = 'unavailable';
      // to avoid false disconnects
      availability.sync();
    };

    let resumedInit = [{value: 'unavailable'}];

    return super.start(resumedInit, resumedCallback);
  }

resumeDiscoveries() {
  return super.resumeDiscoveries();

}

  onResumeObserver(callback) {
    return super.onResumeObserver(callback);
   }


  discoverUsers(email,domain)
  {
    return super.discoverUsers(email,domain);

  }

  /**
   * This function is used to start the user availability observation for a certain user availability reporter
   * @param  {DiscoveredObject} hyperty       Hyperty to be observed.
   * @return {<Promise> DataObjectObserver}      It returns as a Promise the UserAvailability Data Object Observer.
   */

  observe(hyperty)
    {
      return super.observe(hyperty);

  }


/**
 * This function is used to stop the user availability observation for a certain user
 * @param  {string} availability       the UserAvailability Data Object Observer URL to be unobserved.
 */

  unobserve(availability)
    {
      return super.unobserve(availability);

  }

}

export default function activate(hypertyURL, bus, configuration, factory) {
  return {
    name: 'UserKwhObserver',
    instance: new UserKwhObserver(hypertyURL, bus, configuration, factory)
  };
}
