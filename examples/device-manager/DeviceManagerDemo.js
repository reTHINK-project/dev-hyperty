
function hypertyLoaded(result, runtimeLoader = null) {

  console.log('[DeviceManager] hyperty loaded', result);
  if (runtimeLoader != null) {
    runtimeLoader.requireProtostub('sharing-cities-dsm');
  }

  result.identityManager.discoverUserRegistered().then(function(identity) {
    hypertyReady(result, identity);
  });


}

function hypertyReady(result, identity) {

  console.log('[DeviceManager] hyperty Ready', result, identity);
  result.start(identity);

  var creating = $('.device-details');
  var createDeviceBtn = creating.find('.create-device-btn');
  var createStreamBtn = creating.find('.create-stream-btn');
  var streamsLable = creating.find('.streams-label');


  var deviceData = creating.find('.device-data');
  var createStream = creating.find('.create-stream');

  var createStreamSection = creating.find('.create-stream');
  var searchForm = createStreamSection.find('.form');

  createDeviceBtn.on('click', function(e) {

    result.createDevice().then(function(result) {
      console.log('[DeviceManager] createDevice result', result);

      var name;
      if (result.body.code == 200) {
        if (result.body.description == 'device already exist') {
          name = 'reused Device with name: ' + result.body.device.name;
        } else {
          name = 'Device created with name: ' + result.body.device.name;
        }

        streamsLable.removeClass("hide");
        createStreamBtn.removeClass("hide");
        createDeviceBtn.addClass("hide");


        var streamList = result.body.device.stream_list;


      } else if (result.body.code == 408) {
        name = 'Timeout creating Device';
      }
      deviceData.text(name);
      deviceData.removeClass("hide");

    });

  });

  createStreamBtn.on('click', function(e) {
    createStream.removeClass("hide");
    searchForm.removeClass("hide");
  });




  var inputPlatformID = searchForm.find('.platformID');



  searchForm.on('submit', function(event) {
    event.preventDefault();

    var platformID = inputPlatformID.val();


    console.log('CREATing for: ', platformID);
    result.createEndpoint(platformID).then(function(result) {

      if (result.body.description != 'stream already exist') {
        var text = 'name: ' + result.body.stream.name + '  platform: ' + result.body.stream.platform;
        var $userAvailability = $('<li/>').attr('url', 'test').text(text);
        var streams_list = creating.find('.streams-list');
        streams_list.append($userAvailability);
        searchForm.addClass("hide");
      } else {
        var text = 'name: ' + platformID + ' already exist';
        var $userAvailability = $('<li/>').attr('url', 'test').text(text);
        var streams_list = creating.find('.streams-list');
        streams_list.append($userAvailability);
        searchForm.addClass("hide");
      }


    });
  });
}
