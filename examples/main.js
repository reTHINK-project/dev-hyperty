// jshint browser:true, jquery: true
// jshint varstmt: true

import rethink from '../resources/factories/rethink';

import {getTemplate, serialize} from '../src/utils/utils';

import config from '../config.json';

window.KJUR = {};

let domain = config.domain;
let runtimeLoader;

console.log('Configuration file before:', config);

if (config.development) {

  config.domain = window.location.hostname;
  config.runtimeURL = config.runtimeURL.replace(domain, window.location.hostname);
}

console.log('Configuration file after:', config);

rethink.install(config).then(function(result) {

  runtimeLoader = result;
  console.log('Installed:', result);

  if (config.development) {
    let a = loadStubs();
    console.log('AAA: ', a);
  }

  return getListOfHyperties(domain);

}).then(function(hyperties) {

  let $dropDown = $('#hyperties-dropdown');

  hyperties.forEach(function(key) {
      let $item = $(document.createElement('li'));
      let $link = $(document.createElement('a'));

      // create the link features
      $link.html(key);
      $link.css('text-transform', 'none');
      $link.attr('data-name', key);
      $link.on('click', loadHyperty);

      $item.append($link);

      $dropDown.append($item);
    });

  $('.preloader-wrapper').remove();
  $('.card .card-action').removeClass('center');
  $('.hyperties-list-holder').removeClass('hide');

}).catch(function(reason) {
  console.error(reason);
});

function loadStubs() {

  domain = window.location.hostname;
  let protostubsURL = 'https://' + domain + '/.well-known/protocolstub/ProtoStubs.json';

  return new Promise(function(resolve, reject) {
    $.ajax({
      url: protostubsURL,
      success: function(result) {
        let response = [];
        if (typeof result === 'object') {
          Object.keys(result).forEach(function(key) {
            response.push(key);
          });
        } else if (typeof result === 'string') {
          response = JSON.parse(result);
        }

        let stub = response.filter((stub) => {
          return stub === window.location.hostname;
        });

        if (stub.length) {
          runtimeLoader.requireProtostub('https://' + domain + '/.well-known/protocolstub/' + stub[0])
          .then((result) => {
            console.log('result', result);
            resolve(response);
          });
        }

      },
      fail: function(reason) {
        reject(reason);
        notification(reason, 'warn');
      }
    });
  });
}

function getListOfHyperties(domain) {

  let hypertiesURL = 'https://catalogue.' + domain + '/.well-known/hyperty/';
  if (config.development) {
    domain = window.location.hostname;
    hypertiesURL = 'https://' + domain + '/.well-known/hyperty/Hyperties.json';
  }

  return new Promise(function(resolve, reject) {
        $.ajax({
            url: hypertiesURL,
            success: function(result) {
                let response = [];
                if (typeof result === 'object') {
                  Object.keys(result).forEach(function(key) {
                      response.push(key);
                    });
                } else if (typeof result === 'string') {
                  response = JSON.parse(result);
                }
                resolve(response);
              },
            fail: function(reason) {
                reject(reason);
                notification(reason, 'warn');
              }

          });
      });
}

let loading = false;
function loadHyperty(event) {
  event.preventDefault();

  if (loading) return;
  loading = true;

  let hypertyName = $(event.currentTarget).attr('data-name');

  let hypertyPath = 'hyperty-catalogue://catalogue.' + domain + '/.well-known/hyperty/' + hypertyName;
  if (config.development) {
    domain = window.location.hostname;
    hypertyPath = 'hyperty-catalogue://' + domain + '/.well-known/hyperty/' + hypertyName;
  }

  let $el = $('.main-content .notification');
  $el.empty();
  addLoader($el);

  runtimeLoader.requireHyperty(hypertyPath).then(hypertyDeployed).catch(hypertyFail);

}

function hypertyDeployed(hyperty) {

  let $el = $('.main-content .notification');
  removeLoader($el);

  // Add some utils
  serialize();

  let $mainContent = $('.main-content').find('.row');

  let template = '';
  let script = '';

  switch (hyperty.name) {
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

    case 'SurveyReporter':
      template = 'survey/surveyReporter';
      script = 'survey/surveyReporter.js';
      break;

    case 'SurveyObserver':
      template = 'survey/surveyObserver';
      script = 'survey/surveyObserver.js';
      break;

    case 'GroupChat':
      template = 'group-chat/groupChat';
      script = 'group-chat/groupChat.js';
      break;

    case 'NotificationsReporter':
      template = 'notifications/notificationsReporter';
      script = 'notifications/notificationsReporter.js';
      break;

    case 'NotificationsObserver':
      template = 'notifications/notificationsObserver';
      script = 'notifications/notificationsObserver.js';
      break;

    case 'Location':
      template = 'location/location';
      script = 'location/location.js';
      break;

    case 'RoomClient':
      template = 'room-ui/roomClient';
      script = 'room-ui/roomClient.js';
      break;

    case 'RoomServer':
      template = 'room-ui/roomServer';
      script = 'room-ui/roomServer.js';
      break;

    case 'UserStatus':
      template = 'user-status/UserStatus';
      script = 'user-status/user-status.js';
      break;

    case 'BraceletSensorObserver':
      template = 'bracelet/bracelet';
      script = 'bracelet/BraceletSensorObserver.js';
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
  });

}

function hypertyFail(reason) {
  console.error(reason);
  notification(reason, 'error');
}

function addLoader(el) {

  let html = '<div class="preloader preloader-wrapper small active">' +
      '<div class="spinner-layer spinner-blue-only">' +
      '<div class="circle-clipper left">' +
      '<div class="circle"></div></div><div class="gap-patch"><div class="circle"></div>' +
      '</div><div class="circle-clipper right">' +
      '<div class="circle"></div></div></div></div>';

  el.addClass('center');
  el.append(html);
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

// runtimeCatalogue.getHypertyDescriptor(hyperty).then(function(descriptor) {
//   console.log(descriptor);
// }).catch(function(reason) {
//   console.error('Error: ', reason);
// });
