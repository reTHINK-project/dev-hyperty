// jshint browser:true, jquery: true
// jshint varstmt: false

function hypertyLoaded(result) {

  // Prepare to discover email:
  let search = result.instance.search;

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
                 '<img width="48" height="48" src="' + identity.picture + '" alt="" class="circle">' +
                 '</span><span class="col s10">' +
                 '<b>Name:</b> ' + identity.name + '</br>' +
                 '<b>Email:</b> ' + identity.preferred_username + '</br>' +
                 '<b>UserURL:</b> ' + identity.userURL +
                 '</span></div>';

  $cardPanel.append(userInfo);
  $cardPanel.append(hypertyInfo);

  let $connectForm = $('.discover .form');

  $connectForm.on('submit', (event) => {
    event.preventDefault();

    let dataObjectURL = $('.server-objectReporter').val();
    let instance = result.instance;

    connect(instance, dataObjectURL);
  });


  let $disconnectBtn = $('.discover .disconnect');
  $disconnectBtn.on('click',  (event) => {
    event.preventDefault();

    let instance = result.instance;
    instance.disconnect();
  });

}

function connect(hypertyInstance, dataObjectURL) {

  hypertyInstance.join(dataObjectURL).then((firstData) => {

    console.log('DATA:', firstData);

    Handlebars.getTemplate('node-hyperty/server').then(function(template) {

      let html = template(firstData);
      $(html).attr('data-url', dataObjectURL);
      $('.server').append(html);

      hypertyInstance.onChange((changes) => {
        console.log('INFO: ', changes);
        $('.server .current-time').html(changes.data);
      });

    });

  }).catch((reason) => {
    console.error(reason);
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