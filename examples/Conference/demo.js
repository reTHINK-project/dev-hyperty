// jshint browser:true, jquery: true
// jshint varstmt: false

// import config from '../system.config.json!json';
// import {getTemplate, getUserMedia} from '../../utils/utils';

let confHyperty;

let serverURL;

function getUserMedia(constraints) {
  return new Promise((resolve, reject) => {
    navigator.mediaDevices.getUserMedia(constraints).then((mediaStream) => {
      resolve(mediaStream);
    }).catch((reason) => {
      reject(reason);
    });
  });
}

function hypertyLoaded(result) {

  $('.modal').modal();

  // Prepare to discover email:
  let search = result.instance.search;
  discoverEmail(search);
  search.myIdentity().then((identity) => {
    hypertyReady(result, identity);
  });
}

function hypertyReady(result, identity) {
  let createBtn = $('.create-room-btn');
  let InviteBtn = $('.invite-participants-btn');
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

  confHyperty = result.instance;
  confHyperty.onInvitation((controller, identity) => {
    // console.debug('On Invitation: ', controller, identity);
      notificationHandler(controller, identity);
  });
  createBtn.on('click', createRoom);
  InviteBtn.on('click', inviteParticipants);
}

function inviteParticipants(event) {
  event.preventDefault();
  let createRoomModal = $('.groupcall');
  let createRoomBtn = createRoomModal.find('.btn-create');
  let addParticipantBtn = createRoomModal.find('.btn-add');

  addParticipantBtn.on('click', addParticipantEvent);
  createRoomBtn.on('click', createRoomEvent);
  createRoomModal.modal('open');
}

/*
  Create Room actions
 */

function createRoom(event) {
  event.preventDefault();
  let createRoomModal = $('.create-groupcall');
  createRoomModal.modal('open');
}

function createRoomEvent(event) {
  event.preventDefault();

  let createRoomModal = $('.groupcall');
  let participantsForm = createRoomModal.find('.participants-form');
  let serializedObject = $(participantsForm).serializeArray();
  let users = [];
  let domains = [];

  if (serializedObject) {
    let emailsObject = serializedObject.filter((field) => { return field.name === 'email';});
    users = emailsObject.map((emailObject) => { return emailObject.value; });
    let domainObject = serializedObject.filter((field) => { return field.name === 'domain';});
    domains = domainObject.map((domainObject) => { return domainObject.value; });
  }

  let name = createRoomModal.find('.input-name').val();

  console.log('Participants: ', users, ' domain: ', domains);

  for (value in users) {
    let search = confHyperty.search;
    let emailsObject = serializedObject.filter((field) => { return field.name === 'email';});
    users = emailsObject.map((emailObject) => { return emailObject.value; });
    let domainObject = serializedObject.filter((field) => { return field.name === 'domain';});
    domains = domainObject.map((domainObject) => { return domainObject.value; });
    console.log('users[user] is :',  users[value], domains[value], name)
    search.users([users[value]], [domains[value]], ['connection'], ['audio', 'video']).then((result)=> {
      result.forEach((hyperty) => {
        if (hyperty.hasOwnProperty('userID')) {
          console.debug('hyperty:', hyperty.userID)
           confHyperty.invite(hyperty.userID, name, domains[value]);
        }
      });
    }).catch(emailDiscoveredError);
  }
}

function addParticipantEvent(event) {

  event.preventDefault();

  let createRoomModal = $('.groupcall');
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

function notificationHandler(controller, identity) {
  console.info('---------------- ---- notificationHandler ----------------------------------', controller,'------------------controller._dataObjectObserver.data :',controller._dataObjectObserver.data.serverURL)
  let calleeInfo = identity;
  let incoming = $('.modal-call');
  let acceptBtn = incoming.find('.btn-accept');
  let rejectBtn = incoming.find('.btn-reject');
  let informationHolder = incoming.find('.information');
  var options = options || {video: true, audio: true};
  let toHyperty = controller._dataObjectObserver.data.serverURL;
  // let roomID = controller._connectionEvent.value.roomName;
  let roomID = controller._dataObjectObserver.data.roomName;
  let localMediaStream;

  acceptBtn.on('click', (e) => {
    console.log('accepted call from', calleeInfo);
    e.preventDefault();

    getUserMedia(options).then((mediaStream) => {
      console.info('recieved media stream: ', mediaStream);
      localMediaStream = mediaStream;
      return confHyperty.connect(toHyperty, mediaStream, roomID, domain);
    }).then((result) => {;
      showVideo(result);
      processLocalVideo(localMediaStream);
    }).catch((reason) => {
      console.error(reason);
    });
  });

  rejectBtn.on('click', (e) => {
    controller.decline().then((result) => {
      console.log(result);
    }).catch((reason) => {
      console.error(reason);
    });

    e.preventDefault();
  });

  let parseInformation = '<div class="col s12">' +
        '<div class="row valign-wrapper">' +
          '<div class="col s2">' +
            '<img src="' + calleeInfo.avatar + '" alt="" class="circle responsive-img">' +
          '</div>' +
          '<span class="col s10">' +
            '<div class="row">' +
              '<span class="col s3 text-right">Name: </span>' +
              '<span class="col s9 black-text">' + calleeInfo.cn + '</span>' +
            '</span>' +
            '<span class="row">' +
              '<span class="col s3 text-right">Email: </span>' +
              '<span class="col s9 black-text">' + calleeInfo.username + '</span>' +
            '</span>' +
            '<span class="row">' +
              '<span class="col s3 text-right">Locale: </span>' +
              '<span class="col s9 black-text">' + calleeInfo.locale + '</span>' +
            '</span>' +
            '<span class="row">' +
              '<span class="col s3 text-right">UserURL: </span>' +
              '<span class="col s9 black-text">' + calleeInfo.userURL + '</span>' +
            '</span>' +
          '</div>' +
        '</div>';

  informationHolder.html(parseInformation);
  $('.modal-call').modal('open');

}

function discoverEmail(search) {
  let section = $('.discover');
  let searchForm = section.find('.form');
  let inputField = searchForm.find('.friend-email');
  let inputDomain = searchForm.find('.input-domain');
  section.removeClass('hide');

  searchForm.on('submit', (event) => {
    event.preventDefault();
    let collection = section.find('.collection');
    let collectionItem = '<li class="collection-item item-loader"><div class="preloader-wrapper small active"><div class="spinner-layer spinner-blue-only"><div class="circle-clipper left"><div class="circle"></div></div><div class="gap-patch"><div class="circle"></div></div><div class="circle-clipper right"><div class="circle"></div></div></div></div></li>';
    let email = inputField.val();
    let domain = inputDomain.val();

    collection.empty();
    collection.removeClass('hide');
    collection.addClass('center-align');
    collection.prepend(collectionItem);

    console.log('searching for: ', email, ' at domain: ', domain);
    search.users([email], [domain], ['connection'], ['audio', 'video']).then(emailDiscovered).catch(emailDiscoveredError);

  });
}

function emailDiscovered(result) {
  console.log('Email Discovered: ', result);

  let section = $('.discover');
  let collection = section.find('.collection');
  let loader = collection.find('li.item-loader');
  let collectionItem;

  collection.removeClass('center-align');
  loader.remove();

  if (result.length === 0) {
    collectionItem = '<li class="collection-item orange lighten-3">' +
      '<span class="title">Hyperty not found</span>' +
      '</li>';
    collection.append(collectionItem);
  }

  result.forEach((hyperty) => {
    let itemsFound = collection.find('li[data-url="' + hyperty.userID + '"]');

    if (itemsFound.length) {
      itemsFound[0].remove();
    }

    if (hyperty.hasOwnProperty('userID')) {
      collectionItem = '<li data-user="' + hyperty.userID + '" data-url="' + hyperty.hypertyID + '" class="collection-item">' +
      '<span class="title"><b>UserURL: </b>' + hyperty.userID + '</span>' +
      '<a title="Call to ' + hyperty.userID + '" class="waves-effect waves-light btn call-btn secondary-content"><i class="material-icons">call</i></a>' +
      '<p><b>DescriptorURL: </b>' + hyperty.descriptor + '<br><b>HypertyURL: </b>' + hyperty.hypertyID +
      '<br><b>Resources: </b>' + JSON.stringify(hyperty.resources) +
      '<br><b>DataSchemes: </b>' + JSON.stringify(hyperty.dataSchemes) +
      '</p></li>';
    } else {
      collectionItem = '<li class="collection-item orange lighten-3">' +
      '<span class="title">Hyperty not found</span>' +
      '</li>';
    }
    collection.append(collectionItem);
  });

  let callBtn = collection.find('.call-btn');

  callBtn.on('click', (event) => {
    event.preventDefault();
    let userURL = $(event.currentTarget).parent().attr('data-user');
    let hypertyURL = $(event.currentTarget).parent().attr('data-url');
    let domain = hypertyURL.substring(hypertyURL.lastIndexOf(':') + 3, hypertyURL.lastIndexOf('/'));
    openVideo(userURL, domain);
  });

}

function emailDiscoveredError(result) {

  console.error('Email Discovered Error: ', result);

  let section = $('.discover');
  let collection = section.find('.collection');
  let collectionItem = '<li class="collection-item orange lighten-3"><i class="material-icons left circle">error_outline</i>' + result + '</li>';

  collection.empty();
  collection.removeClass('center-align');
  collection.removeClass('hide');
  collection.append(collectionItem);
}

function openVideo(hyperty, domain) {

  console.log('connecting to hyperty: ', hyperty);

  let toHyperty = hyperty;
  let roomID = document.getElementById('roomName').value;
  let localMediaStream;
  var options = options || {video: true, audio: true};

  getUserMedia(options).then((mediaStream) => {
    localMediaStream = mediaStream;
    serverURL = toHyperty;
    return confHyperty.connect(toHyperty, mediaStream, roomID, domain);
  }).then((controller) => {
    showVideo(controller);
    processLocalVideo(localMediaStream);
  }).catch((reason) => {
    console.error(reason);
  });
}

function processVideo(event, user) {
  console.log('Process Video: ', event);

  let remoteVideo = document.createElement("video");
  remoteVideo.setAttribute("style", "width: 450px;");
  remoteVideo.id = user;
  remoteVideo.autoplay = true;
  remoteVideo.src = URL.createObjectURL(event.stream);
  $('#video-container').append(remoteVideo);
  console.debug('Creation complete!');
}


function processLocalVideo(mediaStream) {
  console.log('Process Local Video: ', mediaStream);

  let videoHolder = $('.video-holder');
  let video = videoHolder.find('.my-video');
  video[0].src = URL.createObjectURL(mediaStream);
}

function disconnecting() {

  let videoHolder = $('.video-holder');
  let myVideo = videoHolder.find('.my-video');
  let video = videoHolder.find('.video');
  myVideo[0].src = '';
  video[0].src = '';
  videoHolder.addClass('hide');
}

function showVideo(controller) {
  console.debug('showVideo controller:  ', controller)
  var videoHolder = $('.video-holder');
  videoHolder.removeClass('hide');

  var btnCamera = videoHolder.find('.camera');
  var btnMute = videoHolder.find('.mute');
  var btnMic = videoHolder.find('.mic');
  var btnHangout = videoHolder.find('.hangout');

  controller.onAddStream((event, user) => {
    console.debug('controller.onAddStream : ', controller, event, user);
    processVideo(event, user);
  });

  controller.onDisconnect((identity) => {
    disconnecting();
  });

  btnCamera.on('click', (event) => {
    event.preventDefault();
    controller.disableVideo().then((status) => {
      console.log(status, 'camera');
      var icon = 'videocam_off';
      var text = 'Disable Camera';
      if (!status) {
        text = 'Enable Camera';
        icon = 'videocam';
      }
    }).catch((e) => {
      console.error(e);
    });
  });

  btnMute.on('click', (event) => {
    event.preventDefault();
    controller.mute().then((status) => {
      console.log(status, 'audio');
      var icon = 'volume_off';
      var text = 'Disable Sound';
      if (!status) {
        text = 'Enable Sound';
        icon = 'volume_up';
      }
    }).catch((e) => {
      console.error(e);
    });
    console.log('mute other peer');
  });

  btnMic.on('click', (event) => {
    event.preventDefault();
    controller.disableAudio().then((status) => {
      console.log(status, 'mic');
      var icon = 'mic_off';
      var text = 'Disable Microphone';
      if (!status) {
        icon = 'mic';
        text = 'Enable Microphone';
      }
    }).catch((e) => {
      console.error(e);
    });

  });

  btnHangout.on('click', (event) => {
    event.preventDefault();
    controller.disconnect().then((status) => {
      console.log('Status of Handout:', status);
      $('.my-video-buttons').addClass('hide');
      $('.video-holder').addClass('hide');
      $('.my-video').addClass('hide');
      disconnecting();
    }).catch((e) => {
      console.error(e);
    });
    console.log('hangout');
  });
}
