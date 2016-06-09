// jshint browser:true, jquery: true
// jshint varstmt: false
/* global Handlebars */
/* global Materialize */

var chatGroupManager;

function hypertyLoaded(result) {

  let hypertyInfo = '<span class="white-text">' +
                    '<b>Name:</b> ' + result.name + '</br>' +
                    '<b>Status:</b> ' + result.status + '</br>' +
                    '<b>HypertyURL:</b> ' + result.runtimeHypertyURL + '</br>' +
                    '</span>';
  $('.card-panel').html(hypertyInfo);

  chatGroupManager = result.instance;
  chatGroupManager.onInvitation(onInvitation);

  let messageChat = $('.chat');
  messageChat.removeClass('hide');

  let chatSection = $('.chat-section');
  chatSection.removeClass('hide');

  let createBtn = $('.create-room-btn');
  let joinBtn = $('.join-room-btn');

  createBtn.on('click', createRoom);
  joinBtn.on('click', joinRoom);
}

function onInvitation(event) {
  console.log('On Invitation: ', event);

  chatGroupManager.join(event.url).then(function(chatController) {
    prepareChat(chatController);
  }).catch(function(reason) {
    console.error('Error connectin to', reason);
  });

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
    '<div class="input-field col s12">' +
    '  <input class="input-email" name="email" id="email-' + countParticipants + '" required aria-required="true" type="text">' +
    '  <label for="email-' + countParticipants + '">Participant Email</label>' +
    '</div>' +
  '</div>';

  participants.append(participantEl);

}

function createRoomEvent(event) {
  event.preventDefault();

  let createRoomModal = $('.create-chat');
  let participantsForm = createRoomModal.find('.participants-form');
  let serializedObject = $(participantsForm).serializeArray();
  let users = [];
  if (serializedObject) {
    let emailsObject = serializedObject.filter((field) => { return field.name === 'email';});
    users = emailsObject.map((emailObject) => { return emailObject.value; });
  }

  // Prepare the chat
  let name = createRoomModal.find('.input-name').val();

  console.log('Participants: ', users);

  chatGroupManager.create(name, users).then(function(chatController) {

    let isOwner = true;
    prepareChat(chatController, isOwner);
    participantsForm[0].reset();

  }).catch(function(reason) {
    console.error(reason);
  });
}

/*
  Join to an existent chat room
 */
function joinRoom(event) {
  event.preventDefault();

  let joinModal = $('.join-chat');
  let joinBtn = joinModal.find('.btn-join');
  joinBtn.on('click', function(event) {

    event.preventDefault();

    let resource = joinModal.find('.input-name').val();

    chatGroupManager.join(resource).then(function(chatController) {
      prepareChat(chatController);
    }).catch(function(reason) {
      console.error(reason);
    });

  });

  joinModal.openModal();

}

function prepareChat(chatController, isOwner) {

  console.log('Chat Group Controller: ', chatController);

  chatController.onMessage(function(message) {
    console.info('new message recived: ', message);
    processMessage(message);
  });

  chatController.onChange(function(event) {
    console.log('App - OnChange Event:', event);
  });

  chatController.onUserAdded(function(event) {
    console.log('App - onUserAdded Event:', event);
    processNewUser(event);
  });

  chatController.onUserRemoved(function(event) {
    console.log('App - onUserRemoved Event:', event);
  });

  chatController.onClose(function(event) {
    console.log('App - onClose Event:', event);

    $('.chat-section').remove();
  });

  Handlebars.getTemplate('group-chat-manager/chat-section').then(function(html) {

    $('.chat-section').append(html);

    // Process Existent participants
    if (chatController.dataObject.data && chatController.dataObject.data.participants) {

      let users = chatController.dataObject.data.participants || [];

      users.map(function(user) {

        let userProfile = {};
        if (user.hasOwnProperty('userProfile')) {
          userProfile = user;
        } else {
          userProfile.userProfile = user;
        }

        processNewUser(userProfile);

      });

    }

    chatManagerReady(chatController, isOwner);

    let inviteBtn = $('.invite-btn');
    inviteBtn.on('click', function(event) {

      event.preventDefault();

      inviteParticipants(chatController);
    });

  });

}

function inviteParticipants(chatController) {

  let inviteModal = $('.invite-chat');
  let inviteBtn = inviteModal.find('.btn-modal-invite');

  inviteBtn.on('click', function(event) {

    event.preventDefault();

    let usersIDs = inviteModal.find('.input-emails').val();
    let usersIDsParsed = [];
    if (usersIDs.includes(',')) {
      usersIDsParsed = usersIDs.split(', ');
    } else {
      usersIDsParsed.push(usersIDs);
    }

    chatController.addUser(usersIDsParsed).then(function(result) {
      console.log('Invite emails', result);
    }).catch(function(reason) {
      console.log('Error:', reason);
    });

  });

  inviteModal.openModal();

}

function chatManagerReady(chatController, isOwner) {

  let chatSection = $('.chat-section');
  let addParticipantModal = $('.add-participant');
  let btnAdd = addParticipantModal.find('.btn-add');
  let btnCancel = addParticipantModal.find('.btn-cancel');

  let messageForm = chatSection.find('.message-form');
  let textArea = messageForm.find('.materialize-textarea');

  Handlebars.getTemplate('group-chat-manager/chat-header').then(function(template) {
    let name = chatController.dataObject.data.name;
    let resource = chatController.dataObject._url;

    let html = template({name: name, resource: resource});
    $('.chat-header').append(html);

    if (isOwner) {

      let closeBtn = $('.close-btn');
      closeBtn.removeClass('hide');
      closeBtn.on('click', function(event) {

        event.preventDefault();

        closeChat(chatController);
      });
    }

  });

  textArea.on('keyup', function(event) {

    if (event.keyCode === 13 && !event.shiftKey) {
      messageForm.submit();
    }

  });

  messageForm.on('submit', function(event) {

    event.preventDefault();

    let object = $(this).serializeObject();
    let message = object.message;

    chatController.send(message).then(function(result) {
      console.log('message sent', result);
      processMessage(result);
      messageForm[0].reset();
    }).catch(function(reason) {
      console.error('message error', reason);
    });

  });

  btnAdd.on('click', function(event) {
    event.preventDefault();

    let emailValue = addParticipantModal.find('.input-name').val();
    chatController.addParticipant(emailValue).then(function(result) {
      console.log('hyperty', result);
    }).catch(function(reason) {
      console.error(reason);
    });

  });

  btnCancel.on('click', function(event) {
    event.preventDefault();
  });

}

function processMessage(message) {

  let chatSection = $('.chat-section');
  let messagesList = chatSection.find('.messages .collection');
  let avatar = '';
  let from = '';

  if (message.identity) {
    avatar = message.identity.userProfile.avatar;
    from = message.identity.userProfile.cn;
  }

  let list = `<li class="collection-item avatar">
    <img src="` + avatar + `" alt="" class="circle">
    <span class="title">` + from + `</span>
    <p>` + message.value.chatMessage.replace(/\n/g, '<br>') + `</p>
  </li>`;

  messagesList.append(list);
}

function processNewUser(event) {

  console.log('ADD PARTICIPANT: ', event);

  let section = $('.conversations');
  let collection = section.find('.participant-list');
  let collectionItem = [];

  if (event.hasOwnProperty('data') && event.data) {

    let users = event.data;

    users.map(function(user) {
      collectionItem.push('<li class="chip" data-name="' + user.userProfile.userURL + '"><img src="' + user.userProfile.avatar + '" alt="Contact Person">' + user.userProfile.cn + '<i class="material-icons close">close</i></li>');
    });

  } else if (event.hasOwnProperty('userProfile')) {
    let user = event;
    collectionItem.push('<li class="chip" data-name="' + user.userProfile.userURL + '"><img src="' + user.userProfile.avatar + '" alt="Contact Person">' + user.userProfile.cn + '<i class="material-icons close">close</i></li>');
  }

  collection.removeClass('center-align');

  setTimeout(function() {

    collectionItem.forEach(function(item) {
      collection.append(item);
    });

  }, 200);

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

function closeChat(chatController) {

  chatController.close().then(function(result) {
    console.log('Chat closed: ', result);

    let createRoomModal = $('.create-chat');
    let createRoomBtn = createRoomModal.find('.btn-create');
    let addParticipantBtn = createRoomModal.find('.btn-add');

    addParticipantBtn.off('click', addParticipantEvent);
    createRoomBtn.off('click', createRoomEvent);

    $('.chat-section').remove();
  }).catch(function(reason) {
    console.log('An error occured:', reason);
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
