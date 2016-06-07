/* global $, Handlebars */

let hyperty;

function hypertyLoaded(result) {
  console.log('hypertyLoaded', result);

  let hypertyInfo = '<span class="white-text">' +
                    '<b>Name:</b> ' + result.name + '</br>' +
                    '<b>Status:</b> ' + result.status + '</br>' +
                    '<b>HypertyURL:</b> ' + result.runtimeHypertyURL + '</br>' +
                    '</span>';

  $('.card-panel').html(hypertyInfo);

  hyperty = result.instance;
  let userDirectory = [
      ['openidtest10@gmail.com', 'testOpenID10', 'localhost'],
      ['openidtest20@gmail.com', 'testOpenID20', 'localhost']
  ];
  let participants = [];
  Handlebars.getTemplate('user-status/user-card').then(function(template) {
    $.each(userDirectory, function(i, v) {
      $('.user-list').append(template({email: v[0], password: v[1]}));
      participants.push({email: v[0], domain: v[2]});
    });
    $('.btn-change-state').on('click', function() {
      hyperty.setStatus($(this).attr('rel'));
    });

    hyperty.create(participants).then(function(res) {
      console.info(res);
    }).catch(function(reason) {
      console.error(reason);
    });
  });

  hyperty.addEventListener('statusChange', function(event) {
    console.log('handle statusChange event for', event);
    let email = (typeof event !== 'undefined' && typeof event.identity !== 'undefined') ? event.identity.email : 'none';
    $('#user-list').children('[rel="' + email + '"]').removeClass('state-disconnected state-connected state-busy').addClass('state-' + event.status.status);
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
