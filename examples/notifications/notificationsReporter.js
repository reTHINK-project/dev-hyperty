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

  let form = $('.notification-form');
  let sendBtn = $('.btn-send');
  let addParticipantBtn = form.find('.btn-add');

  addParticipantBtn.on('click', addParticipantEvent);
  sendBtn.on('click', sendNotification);
}

function addParticipantEvent(event) {

  event.preventDefault();

  let createRoomModal = $('.notification-form');
  let participants = $('.participants-form');
  let countParticipants = participants.length - 1;

  countParticipants++;

  let participantEl = '<div class="row">' +
    '<div class="input-field col s8">' +
    '  <input class="input-email" name="email" id="email-' + countParticipants + '" required aria-required="true" type="text">' +
    '  <label for="email-' + countParticipants + '">Participant Email</label>' +
    '</div>' +
    '<div class="input-field col s4">' +
    '  <input class="input-domain" name="domain" id="domain-' + countParticipants + '" type="text">' +
    '  <label for="domain-' + countParticipants + '">Participant domain</label>' +
    '</div>' +
  '</div>';

  participants.append(participantEl);

}

function sendNotification(event)  {
  event.preventDefault();

  let createRoomModal = $('notification-form');

  let participants = [];
  let serializedObject = $('.participants-form').serializeObjectArray();

  console.log(serializedObject);

  if (serializedObject.hasOwnProperty('email')) {

    serializedObject.email.forEach(function(value, index) {
      participants.push({email: value, domain: serializedObject.domain[index]});
    });

  }

  console.log('Participants: ', participants);

  notificationsHy.send(participants, 
          {type: "NETWORK_NOTIFICATION", payload: {message:$("textarea").val()}})
}
