// jshint browser:true, jquery: true
// jshint varstmt: false
/* global Handlebars */
/* global Materialize */

var chatGroupManager;

function hypertyLoaded(result) {

  $('.modal').modal();
  $('.modal.preview').modal({
    complete: function() {
      $('.modal.preview').find('.modal-content').empty();
    }
  });

  $('.modal.download').modal({
    complete: function() {
      $('.modal.download').find('.modal-content').empty();
    }
  });

  chatGroupManager = result.instance;
  chatGroupManager.onInvitation((event) => {
    onInvitation(event);
  });

  // Prepare to discover email:
  var search = result.instance.search;

  search.myIdentity().then(function(identity) {
    hypertyReady(result, identity);
  });
}

function hypertyReady(result, identity) {

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

  /*$('.create-room-btn').hide();
  $('.join-room-btn').hide();*/


  chatGroupManager.onResumeObserver((chatControllers) => {


    getSectionTpl().then(() => {
      console.log('[GroupChatManagerDemo - on Resume observers] - Section Template ready:', chatControllers);

      let groupChats = Object.values(chatControllers);

      if (groupChats.length >= 0) {
        $('.create-room-btn').hide();
        $('.join-room-btn').hide();

        let messageChat = $('.chat');
        messageChat.removeClass('hide');

        let chatSection = $('.chat-section');
        chatSection.removeClass('hide');
        groupChats.forEach((chatController) => {

          chatManagerReady(chatController, false);
          prepareChat(chatController, false);

        });
      }
    })
  });

  chatGroupManager.onResumeReporter((chatControllers) => {

    getSectionTpl().then(() => {
      console.log('[GroupChatManagerDemo - on Resume reporters] - Section Template ready:', chatControllers);

      let groupChats = Object.values(chatControllers);

      if (groupChats.length >= 0) {
        $('.create-room-btn').hide();
        $('.join-room-btn').hide();


        groupChats.forEach((chatController) => {
          chatManagerReady(chatController, true);
          prepareChat(chatController, true);

        });

      }

    });

  });
  let messageChat = $('.chat');
  messageChat.removeClass('hide');

  let chatSection = $('.chat-section');
  chatSection.removeClass('hide');

  let createBtn = $('.create-room-btn');
  let joinBtn = $('.join-room-btn');

  createBtn.on('click', createRoom);
  joinBtn.on('click', joinRoom);

}

/*function enableCreationJoin() {

  let createBtn = $('.create-room-btn');
  let joinBtn = $('.join-room-btn');

  createBtn.on('click', createRoom);
  joinBtn.on('click', joinRoom);
}*/


function onInvitation(event) {
  console.log('On Invitation: ', event);

  getSectionTpl().then(() => {
    console.log('[GroupChatManagerDemo - On Invitation] - Section Template ready', event);
    return chatGroupManager.join(event.url)
  }).then((chatController) => {
    $('.create-room-btn').hide();
    $('.join-room-btn').hide();
    chatManagerReady(chatController, false);
    prepareChat(chatController, false);
  }).catch(function(reason) {
    console.error('Error connecting to', reason);
  });

}

/*
  Create Room actions
 */
function createRoom(event) {
  event.preventDefault();

  let createRoomModal = $('.create-chat');
  let createRoomBtn = createRoomModal.find('.btn-create');
  let cancelRoomBtn = createRoomModal.find('.btn-cancel');

  let addParticipantBtn = createRoomModal.find('.btn-add');

  addParticipantBtn.on('click', addParticipantEvent);
  createRoomBtn.on('click', createRoomEvent);
  createRoomModal.modal('open');
  cancelRoomBtn.on('click', cancelRoomEvent);
}

function cancelRoomEvent(event) {
  event.preventDefault();

  let createRoomModal = $('.create-chat');
  let createRoomBtn = createRoomModal.find('.btn-create');
  let cancelRoomBtn = createRoomModal.find('.btn-cancel');
  let addParticipantBtn = createRoomModal.find('.btn-add');
  let participantsForm = createRoomModal.find('.participants-form');

  participantsForm[0].reset();
  createRoomModal.find('.input-name').val('');

  createRoomBtn.off('click');
  cancelRoomBtn.off('click');
  addParticipantBtn.off('click');
}

function addParticipantEvent(event) {

  event.preventDefault();

  let createRoomModal = $('.create-chat');
  let participants = createRoomModal.find('.participants-form');
  let countParticipants = participants.length - 1;

  countParticipants++;

  let participantEl = '<div class="row">' +
    '<div class="input-field col s8">' +
    '  <input class="input-email" name="email" id="email-' + countParticipants + '" required aria-required="true" type="text" >' +
    '  <label for="email-' + countParticipants + '">Participant Email</label>' +
    '</div>' +
    '<div class="input-field col s4">' +
    '  <input class="input-domain" name="domain" id="domain-' + countParticipants + '" type="text"">' +
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

  let createRoomBtn = createRoomModal.find('.btn-create');
  createRoomBtn.off('click');

  let users = [];
  let domains = [];
  let participants = [];

  if (serializedObject) {

    let emailsObject = serializedObject.filter((field) => {
      if (field.value !== '') return field.name === 'email';
    });

    users = emailsObject.map((emailObject) => { return emailObject.value; });
    let domainObject = serializedObject.filter((field) => {
      return field.name === 'domain';

      /*if (field.value !== '') {
        return field.name === 'domain';
      }*/

    });

    domainObject.forEach((domain)=>{
      if (!domain.value)
       domain.value = chatGroupManager._domain;
    });
    domains = domainObject.map((domainObject) => {
      if (domainObject.value) { return domainObject.value; }
      //else return chatGroupManager._domain;
    });

    let part;

    for (part = 0; part < users.length; part ++) {
      participants[part] = { user: users[part], domain: domains[part] };
    }

  }

  // Prepare the chat
  let name = createRoomModal.find('.input-name').val();

  console.log('Participants: ', participants);

  getSectionTpl().then(() => {
    console.log('[GroupChatManagerDemo - Create Room] - Section Template ready:', name, participants);
    return chatGroupManager.create(name, participants);
  }).then((chatController) => {

    let isOwner = true;
    chatManagerReady(chatController, isOwner);
    prepareChat(chatController, isOwner);
    participantsForm[0].reset();
    createRoomModal.find('.input-name').val('');
    let createBtn = $('.create-room-btn');
    let joinBtn = $('.join-room-btn');
    createBtn.addClass('hide');
    joinBtn.addClass('hide');

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

    getSectionTpl().then(() => {
      console.log('[GroupChatManagerDemo - JoinRoom] - Section Template ready: ', resource);
      return chatGroupManager.join(resource)
    }).then(function(chatController) {
      chatManagerReady(chatController, false);
      prepareChat(chatController, false);
    }).catch(function(reason) {
      console.error(reason);
    });
  });

  joinModal.modal('open');

}

function getSectionTpl() {

  return new Promise((resolve, reject) => {

    Handlebars.getTemplate('group-chat-manager/chat-section').then(function(html) {

      $('.chat-section').append(html);

      resolve();

    });

  })

}

function prepareChat(chatController, isOwner) {

  console.log('[GroupChatManagerDemo prepareChat] Chat Group Controller: ', chatController);

  let dataObject = chatController.dataObjectObserver || chatController.dataObjectReporter || {};
  console.log('[GroupChatManagerDemo prepareChat] dataObject: ', dataObject);
  let users = dataObject.data.participants || {};
  let msgs = chatController.messages || {};

  Object.keys(users).forEach(function(objectKey, index) {
    var user = users[objectKey];
    processNewUser(user);
  });

  Object.keys(msgs).forEach(function(objectKey, index) {
    let msg = {
      value: msgs[objectKey].data,
      identity: msgs[objectKey].identity
    };

    if (msgs[objectKey].resourceType) msg.resource = msgs[objectKey];

    console.log('[GroupChatManagerDemo.prepareChat] for msg ', msg);

    processMessage(msg);
  });

  chatController.onMessage(function(message) {
    console.info('[GroupChatManagerDemo ] new message received: ', message);
    processMessage(message);
  });

  chatController.onChange(function(event) {
    console.log('[GroupChatManagerDemo ] OnChange Event:', event);
  });

  chatController.onUserAdded(function(event) {
    console.log('[GroupChatManagerDemo ] onUserAdded Event:', event);
    processNewUser(event);
  });

  chatController.onUserRemoved(function(event) {
    console.log('[GroupChatManagerDemo ] onUserRemoved Event:', event);
    removeParticipant(event.userURL);
  });

  chatController.onClose(function(event) {
    console.log('[GroupChatManagerDemo ] onClose Event:', event);
    $('.chat-section').html('');

    $('.create-room-btn').show();
    $('.join-room-btn').show();
  });

  $('.modal').modal();

  let inviteBtn = $('.invite-btn');
  inviteBtn.on('click', function(event) {

    event.preventDefault();

    inviteParticipants(chatController, isOwner);
  });

}

function inviteParticipants(chatController, isOwner) {

  let inviteModal = $('.invite-chat');
  let inviteBtn = inviteModal.find('.btn-modal-invite');

  inviteBtn.on('click', function(event) {

    event.preventDefault();

    let userID = inviteModal.find('.input-emails').val();
    let domain = inviteModal.find('.input-domains').val();

    if (!domain) { domain = chatController.domain; }

    let user = { user: userID, domain: domain };

    console.log('[GroupChatManagerDemo.inviteParticipants]: ', user);

    /*let usersIDsParsed = [];
    if (usersIDs.includes(',')) {
      usersIDsParsed = usersIDs.split(',');
    } else {
      usersIDsParsed.push(usersIDs);
    }

    let domainsParsed = [];
    if (domains.includes(',')) {
      domainsParsed = domains.split(',');
    } else {
      domainsParsed.push(domains);
    }*/

    if (isOwner) chatController.addUser([user]).then(function(result) {
      console.log('[GroupChatManager.demo.inviteParticipants] Invitation result: ', result);
    }).catch(function(reason) {
      console.log('Error:', reason);
    });
    else chatController.addUserReq([user]).then(function(result) {
      console.log('[GroupChatManager.demo.inviteParticipants] Request to Reporter result: ', result);
    }).catch(function(reason) {
      console.log('Error:', reason);
    });

    inviteBtn.off('click');
  });

  inviteModal.modal('open');

}

function chatManagerReady(chatController, isOwner) {

  let chatSection = $('.chat-section');
  let addParticipantModal = $('.add-participant');
  let btnAdd = addParticipantModal.find('.btn-add');
  let btnCancel = addParticipantModal.find('.btn-cancel');

  let messageForm = chatSection.find('.message-form');
  let fileForm = chatSection.find('.file-form');
  //let file = $( "input:file" )
  let textArea = messageForm.find('.materialize-textarea');

  Handlebars.getTemplate('group-chat-manager/chat-header').then(function(template) {
    let name = chatController.dataObject.metadata.name;
    let resource = chatController.dataObject.url;

    let html = template({name: name, resource: resource});
    $('.chat-header').append(html);

/*    if (!isOwner) {
      $('.invite-btn').hide();
    }*/
    let closeBtn = $('.close-btn');
    closeBtn.removeClass('hide');
    closeBtn.on('click', function(event) {

      event.preventDefault();

      closeChat(chatController);
    });

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

  fileForm.on('change', function(event) {
    console.log('send file event: ', event);

    event.preventDefault();

    let object = $(this).serializeObject();
    let file;
    if (event.target.files){
      file = event.target.files[0];
    } else return;

    console.log('file: ', file);

    chatController.sendFile(file).then(function(result) {
      console.log('file sent', result);
      processMessage(result);
      // processFile(result);
      fileForm[0].reset();
    }).catch(function(reason) {
      console.error('file error', reason);
    });

  });

  btnAdd.on('click', function(event) {
    event.preventDefault();

    let emailValue = addParticipantModal.find('.input-name').val();
    chatController.addParticipant(emailValue).then(function(result) {
      console.log('[GroupChatManager.demo.addParticipant]', result);
    }).catch(function(reason) {
      console.error(reason);
    });
  });

  btnCancel.on('click', function(event) {
    event.preventDefault();
  });

}

var listOf = {};

function processMessage(message) {

  console.log('[GroupChatManagerDemo - processMessage] - msg ', message);

  let chatSection = $('.chat-section');
  let messagesList = chatSection.find('.messages .collection');
  let avatar = '';
  let from = '';

  if (message.identity) {
    avatar = message.identity.userProfile.avatar;
    from = message.identity.userProfile.cn;
  }

  if (message.value) {
    let list = document.createElement('li');
    list.className = 'collection-item avatar';

    let avatarEl = document.createElement('img');
    avatarEl.className = 'circle';
    avatarEl.src = avatar;
    avatarEl.alt = from;

    let nameSpan = document.createElement('span');
    let name = document.createTextNode(from);
    nameSpan.className = 'title';
    nameSpan.appendChild(name);

    list.appendChild(avatarEl);
    list.appendChild(nameSpan);

    console.log('[GroupChatManagerDemo - processMessage] - ', messagesList, message, list);

    let messageEl = document.createElement('p');
    let content;

    if (!message.resource) {
      messageEl.innerHTML = message.value.content.replace(/\n/g, '<br>');
      list.appendChild(messageEl);
    } else {

      listOf[message.resource.resourceType] = {}
      listOf[message.resource.resourceType][message.resource.metadata.url] = message.resource;

      switch (message.resource.resourceType) {

        case 'file':
          var link = document.createElement('a');
          link.addEventListener('click', function(event) {
            console.log(message.resource.resourceType, message.resource.metadata.name);
            readFile(message.resource);
          });

          content = document.createTextNode(message.resource.metadata.name);
          messageEl.appendChild(content);
          list.appendChild(messageEl);

          var img = document.createElement('img');
          img.src = message.resource.metadata.preview;
          img.alt = message.resource.metadata.name;

          link.appendChild(img);

          list.appendChild(link);

          break;
        default:
          break;
      }
    }

    messagesList.append(list);
  }

}

function readFile(file) {

  file.read((progress) => {console.log('[GroupChatManager.demo.readFile] progress: ', progress)}).then((result) => {
    console.log('[GroupChatManager.demo.readFile] ', result);

    let resourceEl;
    let blob;

    if (Array.isArray(result.content)){
      blob = new Blob(result.content, { type: file.metadata.mimetype} );
    } else{
      blob = new Blob([result.content], { type: file.metadata.mimetype} );
    }



    let urlCreator = window.URL || window.webkitURL;
    let url = urlCreator.createObjectURL( blob );

    switch (file.metadata.mimetype) {
      case 'image/png':
      case 'image/jpg':
      case 'image/jpeg':
      case 'image/gif':

        resourceEl = document.createElement('img');
        resourceEl.className = 'responsive-img';
        resourceEl.src = url;

        $('.preview').find('.modal-content').html(resourceEl);
        $('.preview').modal('open');

        break;
      case 'video/mp4':
      case 'video/mkv':

        resourceEl = document.createElement('video');
        resourceEl.autoplay = true;
        resourceEl.controls = true;
        resourceEl.className = 'responsive-video';
        resourceEl.src = url;

        $('.preview').find('.modal-content').html(resourceEl);
        $('.preview').modal('open');

        break;

      default:
        resourceEl = document.createElement('a');
        resourceEl.className = 'waves-effect waves-light btn';
        resourceEl.src = url;

        let textContent = document.createTextNode('download ' + file.metadata.name);
        resourceEl.appendChild(textContent);

        console.log('[GroupChatManagerDemo.readFile] saving file to ', url);

          resourceEl.download = '/sca/' + file.name;

          resourceEl.href = url;

          resourceEl.addEventListener('click', (event) => {
            console.log('[GroupChatManagerDemo.readFile] saving file to disk ', file);

            //(window.URL || window.webkitURL).revokeObjectURL(resourceEl.href);

            });

          $('.download').find('.modal-content').html(resourceEl);
          $('.download').modal('open');

    }

  }).catch((reason) => {
    console.error('reason:', reason);
  })
}

function dataURLToBlob(dataURL, fileType) {

  return new Promise(function(resolve, reject) {

            function processInWebWorker() {
                var blob = URL.createObjectURL(new Blob(['function getBlob(_dataURL, _fileType) {var binary = atob(_dataURL.substr(_dataURL.indexOf(",") + 1)),i = binary.length,view = new Uint8Array(i);while (i--) {view[i] = binary.charCodeAt(i);};postMessage(new Blob([view], {type: _fileType}));};this.onmessage =  function (e) {var data = JSON.parse(e.data); getBlob(data.dataURL, data.fileType);}'], {
                    type: 'application/javascript'
                }));

                var worker = new Worker(blob);
                URL.revokeObjectURL(blob);
                return worker;
            }

            if (!!window.Worker) {
                var webWorker = processInWebWorker();

                webWorker.onmessage = function(event) {
                    resolve(event.data);
                };

                webWorker.postMessage(JSON.stringify({
                    dataURL: dataURL,
                    fileType: fileType
                }));
            } else {
                var binary = atob(dataURL.substr(dataURL.indexOf(',') + 1)),
                    i = binary.length,
                    view = new Uint8Array(i);

                while (i--) {
                    view[i] = binary.charCodeAt(i);
                }

                resolve(new Blob([view]));
            }
        });
      }

function dataURItoBlob(dataURI) {
    // convert base64/URLEncoded data component to raw binary data held in a string
    var byteString;
    if (dataURI.split(',')[0].indexOf('base64') >= 0)
        byteString = atob(dataURI.split(',')[1]);
    else
        byteString = unescape(dataURI.split(',')[1]);

    // separate out the mime component
    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

    // write the bytes of the string to a typed array
    var ia = new Uint8Array(byteString.length);
    for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }

    return new Blob([ia], {
        type: mimeString
    });
}

function processNewUser(event) {

  console.log('[GroupChatManager.demo.processNewUser] ', event);

  let section = $('.conversations');
  let collection = section.find('.participant-list');
  let user;

  if (event.hasOwnProperty('data') && event.data) {
    user = event.data;
  } else {
    user = event;
  }
  console.log('[GroupChatManager.demo.processNewUser]user', user, collection);
  if (collection.find('[data-name="' + user.identity.userProfile.userURL + '"]').length == 0) {
    collection.append(`
      <li class="chip" data-name="${ user.identity.userProfile.userURL }">
        <img src="${ user.identity.userProfile.avatar }" alt="Contact Person">${ user.identity.userProfile.cn }
        <i class="material-icons close">close</i>
      </li>`);
    collection.removeClass('center-align');

    let closeBtn = collection.find('.close');
    closeBtn.on('click', function(e) {
      e.preventDefault();

      let item = $(e.currentTarget).parent().attr('data-name');
      removeParticipant(item);
    });
  }

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
    let createBtn = $('.create-room-btn');
    let joinBtn = $('.join-room-btn');
    createBtn.removeClass('hide');
    joinBtn.removeClass('hide');
    createBtn.show();
    joinBtn.show();

    $('.chat-section').html('');
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
