/* global $, Handlebars */

let userAvailabilityHy;


function hypertyLoaded(result) {
  console.log('hypertyLoaded', result);

  let hypertyInfo = '<span class="white-text">' +
                    '<b>Name:</b> ' + result.name + '</br>' +
                    '<b>Status:</b> ' + result.status + '</br>' +
                    '<b>HypertyURL:</b> ' + result.runtimeHypertyURL + '</br>' +
                    '</span>';

  $('.card-panel').html(hypertyInfo);

  userAvailabilityHy = result.instance;

  let contacts = [];
  let $myAvailability = $('.my_availability');

  Handlebars.getTemplate('user-availability/user-card').then(function(template) {
    $('.btn-change-state').on('click', function() {
      userAvailabilityHy.setStatus($(this).attr('rel'));
      $myAvailability.text($(this).attr('rel'));
    });

  userAvailabilityHy.onResumeReporter((userAvailability) => {
    console.log('[userAvailabilityReporterDemo - on Resume reporters] :', userAvailability);

    if (userAvailability) {
      console.log('[userAvailabilityReporterDemo - on Resume reporters] resuming:', userAvailability);

    } else {
      userAvailabilityHy.create().then(function(availability) {
          console.info('[userAvailabilityReporterDemo] new: ', availability);
          availability.data.values.value = 'available';
          $myAvailability.text(availability.data.values.value);
        }).catch(function(reason) {
          console.error(reason);
        });
      }
    });
  });

userAvailabilityHy.start();

  /*userAvailabilityHy.addEventListener('statusChange', function(event) {
    console.debug('handle statusChange event for', event);
    let email = (typeof event !== 'undefined' && typeof event.identity !== 'undefined') ? event.identity.userProfile.username : 'none';
    $('#user-list').children('[rel="' + email + '"]').removeClass('state-available state-unavailable state-busy state-away').addClass('state-' + event.status);
  });*/
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
