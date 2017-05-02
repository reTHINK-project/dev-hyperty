// jshint browser:true, jquery: true
// jshint varstmt: false
/* global Handlebars */
/* global Materialize */

var hyperty;

function hypertyLoaded(result) {
  hyperty = result
  let createBtn = $('.create-room-btn');
  createBtn.on('click', createRoom);
  result.instance.onInvite(onInvitation)
}

function onInvitation(chat) {
  console.log('On Invitation: ', chat);

    identityReady(hyperty, chat.identity)
    prepareChat(chat);
    //processNewUser(user);
}



/*
  Create Room actions
 */
function createRoom(event) {
  event.preventDefault();

  let createRoomModal = $('.create-chat');
  let createRoomBtn = createRoomModal.find('.btn-create');
  let addParticipantBtn = createRoomModal.find('.btn-add');

  addParticipantBtn.on('click', addParticipantEvent);
  createRoomBtn.on('click', createRoomEvent);
  createRoomModal.openModal();
}

function addParticipantEvent(event) {

  event.preventDefault();

  let createRoomModal = $('.create-chat');
  let participants = createRoomModal.find('.participants-form');
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

function createRoomEvent(event) {
  event.preventDefault();

  let createRoomModal = $('.create-chat');
  let participantsForm = createRoomModal.find('.participants-form');
  let serializedObject = $(participantsForm).serializeArray();
  let participants = [];

  for(var i=0;  i<serializedObject.length; i=i+2){
      participants.push({email: serializedObject[i].value, domain: serializedObject[i+1].value});
  }


  // Prepare the chat
  let name = createRoomModal.find('.input-name').val();

  console.log('Participants: ', participants);

  hyperty.instance.create(name, participants).then(function(chatController) {

    let isOwner = true;
    identityReady(hyperty, chatController.identity)
    prepareChat(chatController, isOwner);
    participantsForm[0].reset();

  }).catch(function(reason) {
    console.error(reason);
  });
}

function prepareChat(chatController, isOwner) {

  console.log('Chat Group Controller: ', chatController);

  chatController.onMessage(function(message) {
    console.info('new message recived: ', message);
    processMessage(message);
  });

  Handlebars.getTemplate('group-chat/chat-section').then(function(html) {

    $('.chat-section').append(html);

    chatManagerReady(chatController, isOwner);

  });

}


function chatManagerReady(chatController, isOwner) {

  let chatSection = $('.chat-section');
  let addParticipantModal = $('.add-participant');
  let btnAdd = addParticipantModal.find('.btn-add');
  let btnCancel = addParticipantModal.find('.btn-cancel');

  let messageForm = chatSection.find('.message-form');
  let textArea = messageForm.find('.materialize-textarea');

  textArea.on('keyup', function(event) {

    if (event.keyCode === 13 && !event.shiftKey) {
      messageForm.submit();
    }

  });

  messageForm.on('submit', function(event) {

    event.preventDefault();

    let object = $(this).serializeObject();
    let message = object.message;

    chatController.sendMessage(message).then(function(result) {
      console.log('message sent', result);
      processMessage(result);
      messageForm[0].reset();
    }).catch(function(reason) {
      console.error('message error', reason);
    });

  });

  btnCancel.on('click', function(event) {
    event.preventDefault();
  });

}

function identityReady(result, identity) {
  $('.create-room-btn').addClass('hide');
  let $cardPanel = $('.card-panel');
  let hypertyInfo = '<div class="row"><span class="white-text">' +
                    '<b>Name:</b> ' + result.name + '</br>' +
                    '<b>Status:</b> ' + result.status + '</br>' +
                    '<b>HypertyURL:</b> ' + result.runtimeHypertyURL + '</br>' +
                    '</span></div>';

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

  let messageChat = $('.chat');
  messageChat.removeClass('hide');

  let chatSection = $('.chat-section');
  chatSection.removeClass('hide');
}
function processMessage(message) {

  let chatSection = $('.chat-section');
  let messagesList = chatSection.find('.messages .collection');
  let avatar = '';
  let from = '';

  if (message.identity) {
    avatar = message.identity.avatar;
    from = message.identity.cn;
  }

  let list = `<li class="collection-item avatar">
    <img src="` + avatar + `" alt="" class="circle">
    <span class="title">` + from + `</span>
    <p>` + message.text.replace(/\n/g, '<br>') + `</p>
  </li>`;

  messagesList.append(list);
}

function processNewUser(event) {

  console.log('ADD PARTICIPANT: ', event);

  let section = $('.conversations');
  let collection = section.find('.participant-list');

  if (event.hasOwnProperty('data') && event.data) {

    let users = event.data;

    users.map(function(user) {
      collection.append('<li class="chip" data-name="' + user.userURL + '"><img src="' + user.avatar + '" alt="Contact Person">' + user.cn + '<i class="material-icons close">close</i></li>');
    });

  } else {
    let user = event;
    console.log('Add User:', user);
    collection.append('<li class="chip" data-name="' + user.userURL + '"><img src="' + user.avatar + '" alt="Contact Person">' + user.cn + '<i class="material-icons close">close</i></li>');
  }

  collection.removeClass('center-align');

  let closeBtn = collection.find('.close');
  closeBtn.on('click', function(e) {
    e.preventDefault();

    let item = $(e.currentTarget).parent().attr('data-name');
    removeParticipant(item);
  });
}

function removeParticipant(item) {
  let section = $('.conversations');
  let collection = section.find('.participant-list');
  let element = collection.find('li[data-name="' + item + '"]');
  element.remove();
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
