// jshint browser:true, jquery: true
// jshint varstmt: true

import {getTemplate, serialize} from './utils';

let loading = false;

export function hypertyDeployed(hyperty) {

  let $el = $('.main-content .notification');
  removeLoader($el);

  // Add some utils
  serialize();

  let $mainContent = $('.main-content').find('.row');

  let template = '';
  let script = '';

  switch (hyperty.name) {

    case 'UserAvailabilityObserver':
      template = 'user-availability/userAvailabilityObserver';
      script = 'user-availability/UserAvailabilityObserverDemo.js';
      break;
    case 'UserKwhObserver':
      template = 'observer-kwh/UserKwhObserver';
      script = 'observer-kwh/UserKwhObserver.js';
      break;

    case 'UserAvailabilityReporter':
      template = 'user-availability/userAvailabilityReporter';
      script = 'user-availability/UserAvailabilityReporterDemo.js';
      break;

    case 'Connector':
      template = 'connector/Connector';
      script = 'connector/demo.js';
      break;

    case 'GroupChatManager':
      template = 'group-chat-manager/ChatManager';
      script = 'group-chat-manager/demo.js';
      break;

    case 'HelloWorldObserver':
      template = 'hello-world/helloWorld';
      script = 'hello-world/helloObserver.js';
      break;

    case 'HelloWorldReporter':
      template = 'hello-world/helloWorld';
      script = 'hello-world/helloReporter.js';
      break;


    case 'NodeHypertyObserver':
      template = 'node-hyperty/NodeHyperty';
      script = 'node-hyperty/NodeHypertyObserver.js';
      break;

    case 'LocationReporter':
      template = 'location/location';
      script = 'location/location.js';
      break;

    case 'LocationReporterDSM':
      template = 'location-dsm/location';
      script = 'location-dsm/location.js';
      break;

    case 'LocationObserver':
      template = 'location/locationObserver';
      script = 'location/locationObserver.js';
      break;

    case 'BraceletSensorObserver':
      template = 'bracelet/bracelet';
      script = 'bracelet/BraceletSensorObserver.js';
      break;

    case 'DTWebRTC':
      template = 'dtwebrtc/dtwebrtc';
      script = 'dtwebrtc/dtwebrtc.js';
      break;
  }

  if (!template) {
    throw Error('You must need specify the template for your example');
  }

  getTemplate(template, script).then(function(template) {
    let html = template();
    $mainContent.html(html);

    if (typeof hypertyLoaded === 'function') {
      hypertyLoaded(hyperty);
    } else {
      let msg = 'If you need pass the hyperty to your template, create a function called hypertyLoaded';
      console.info(msg);
      notification(msg, 'warn');
    }

    loading = false;
  }).catch(function(reason) {

    try {
      eval(reason.responseText);
    } catch (e) {
      console.error(e);
    }

  });

}

export function hypertyFail(reason) {
  console.error(reason);
  notification(reason, 'error');
}

function removeLoader(el) {
  el.find('.preloader').remove();
  el.removeClass('center');
}

function notification(msg, type) {

  let $el = $('.main-content .notification');
  let color = type === 'error' ? 'red' : 'black';

  removeLoader($el);
  $el.append('<span class="' + color + '-text">' + msg + '</span>');
}
