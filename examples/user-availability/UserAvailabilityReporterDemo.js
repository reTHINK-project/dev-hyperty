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
                     '<img width="48" height="48" src="' + identity.avatar + '" alt="" class="circle">' +
                     '</span><span class="col s10">' +
                    '<b>Name:</b> ' + identity.cn + '</br>' +
                    '<b>Email:</b> ' + identity.username + '</br>' +
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

  userAvailabilityHy.onResumeReporter((userAvailability) => {
    console.log('[userAvailabilityReporterDemo - on Resume reporters] :', userAvailability);

    if (userAvailability) {
      console.log('[userAvailabilityReporterDemo - on Resume reporters] resuming:', userAvailability);
      availabilityReady(userAvailability);

    } else {
      userAvailabilityHy.create().then(function(availability) {
          console.info('[userAvailabilityReporterDemo] new: ', availability);

          availabilityReady(availability);
        }).catch(function(reason) {
          console.error(reason);
        });
      }
    });
    userAvailabilityHy.start();
  });


  /*userAvailabilityHy.addEventListener('statusChange', function(event) {
    console.debug('handle statusChange event for', event);
    let email = (typeof event !== 'undefined' && typeof event.identity !== 'undefined') ? event.identity.userProfile.username : 'none';
    $('#user-list').children('[rel="' + email + '"]').removeClass('state-available state-unavailable state-busy state-away').addClass('state-' + event.status);
  });*/
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

  userAvailabilityHy.addEventListener('my-availability-update', function(event) {

    console.log('[UserAvailabilityReporterDemo.availabilityReady] Updated :', event);
    $myAvailability.text(event)

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
