/* global $, Handlebars */

let userStatusHy;


function hypertyLoaded(result) {
  console.log('hypertyLoaded', result);

  let hypertyInfo = '<span class="white-text">' +
                    '<b>Name:</b> ' + result.name + '</br>' +
                    '<b>Status:</b> ' + result.status + '</br>' +
                    '<b>HypertyURL:</b> ' + result.runtimeHypertyURL + '</br>' +
                    '</span>';

  $('.card-panel').html(hypertyInfo);

  userStatusHy = result.instance;
  let userDirectory = [
      ['openidtest10@gmail.com', 'localhost'],
      ['openidtest20@gmail.com', 'localhost']
  ];

  let contacts = [];
  Handlebars.getTemplate('user-status/user-card').then(function(template) {
    $.each(userDirectory, function(i, v) {
      $('.user-list').append(template({email: v[0]}));
      contacts.push({email: v[0], domain: v[1]});
    });
    $('.btn-change-state').on('click', function() {
      userStatusHy.setStatus($(this).attr('rel'));
    });
    
    userStatusHy.create(contacts).then(function(res) {
      console.info(res);
    }).catch(function(reason) {
      console.error(reason);
    });
  });

  userStatusHy.addEventListener('statusChange', function(event) {
    console.debug('handle statusChange event for', event);
    let email = (typeof event !== 'undefined' && typeof event.identity !== 'undefined') ? event.identity.userProfile.username : 'none';
    $('#user-list').children('[rel="' + email + '"]').removeClass('state-available state-unavailable state-busy state-away').addClass('state-' + event.status);
  });
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
