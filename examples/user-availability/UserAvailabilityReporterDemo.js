/* global $, Handlebars */

let userAvailabilityHy;


function hypertyLoaded(result) {
  console.log('hypertyLoaded', result);

    // Prepare to discover email:
    var search = result.instance.search;

    result.instance.identityManager.discoverUserRegistered().then(function(identity) {
      hypertyReady(result, identity);
    });
  }

function hypertyReady(result, identity) {
  let $cardPanel = $('.card-panel');

  let hypertyInfo = '<span class="white-text">' +
                    '<b>Name:</b> ' + result.name + '</br>' +
                    '<b>Status:</b> ' + result.status + '</br>' +
                    '<b>HypertyURL:</b> ' + result.runtimeHypertyURL + '</br>' +
                    '</span>';
  let userInfo = '<div class="row"><span class="white-text">' +
                     '<span class="col s2">' +
                     '<img width="48" height="48" src="' + identity.picture + '" alt="" class="circle">' +
                     '</span><span class="col s10">' +
                    '<b>Name:</b> ' + identity.name + '</br>' +
                    '<b>Email:</b> ' + identity.preferred_username + '</br>' +
                    '<b>UserURL:</b> ' + identity.userURL +
                    '</span></div>';
  $cardPanel.append(userInfo);
  $cardPanel.append(hypertyInfo);

  userAvailabilityHy = result.instance;
  let $myAvailability = $('.my_availability');

  Handlebars.getTemplate('user-availability/user-card').then(function(template) {
    $('.btn-change-state').on('click', function() {
      userAvailabilityHy.setStatus($(this).attr('rel'));
    });

    userAvailabilityHy.start().then((availability)=>{
      availabilityReady(availability);
    }).catch(function(reason) {
      console.error(reason);
    });
  });

}

function availabilityReady(availability) {
  console.log('[userAvailabilityReporterDemo.availabilityReady] ', availability);

  let $contextPanel = $('.context-panel');

  let availabilityInfo = '<div class="row"><span class="white-text">' +
                     '<span class="col s2">' +
                     '</span><span class="col s10">' +
                    '<b>MyAvailability URL:</b> ' + availability.url + '</br>' +
                    '</span></div>';

  $contextPanel.append(availabilityInfo);

  let $myAvailability = $('.my_availability');

  userAvailabilityHy.context.addEventListener('myAvailability-context-update', function(event) {

    console.log('[UserAvailabilityReporterDemo.availabilityReady] Updated :', event);
    $myAvailability.text(event[0].value)

    });
  userAvailabilityHy.setStatus('available');
  }


Handlebars.getTemplate = function(name) {

  return new Promise(function(resolve, reject) {

    if (Handlebars.templates === undefined || Handlebars.templates[name] === undefined) {
      Handlebars.templates = {};
    } else {
      resolve(Handlebars.templates[name]);
    }

    $.ajax({
      url: name + '.hbs',
      success: function(data) {
        Handlebars.templates[name] = Handlebars.compile(data);
        resolve(Handlebars.templates[name]);
      },

      fail: function(reason) {
        reject(reason);
      }
    });

  });

};
