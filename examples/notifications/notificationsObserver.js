// jshint browser:true, jquery: true
// jshint varstmt: false
/* global Handlebars */
/* global Materialize */

var notificationsHy;
var avatar = 'https://lh3.googleusercontent.com/-XdUIqdMkCWA/AAAAAAAAAAI/AAAAAAAAAAA/4252rscbv5M/photo.jpg';

function hypertyLoaded(result) {

  let hypertyInfo = '<span class="white-text">' +
                    '<b>Name:</b> ' + result.name + '</br>' +
                    '<b>Status:</b> ' + result.status + '</br>' +
                    '<b>HypertyURL:</b> ' + result.runtimeHypertyURL + '</br>' +
                    '</span>';
  $('.card-panel').html(hypertyInfo);

  notificationsHy = result.instance;

  notificationsHy.onNotification(processNotification)
}

function processNotification(notification) {

  let messagesList = $('.collection');

  let list = `<li class="collection-item avatar">
    <span class="title">` + notification.type + `</span>
    <p> Data: ` + JSON.stringify(notification.payload) + `</p>
  </li>`;

  messagesList.append(list);
}
