

// "use strict";

var hyperty;

function hypertyLoaded(result) {


  hyperty = result.instance;

  console.log(hyperty);

  $('.selection-panel').hide();

  let hypertyPanel = $('.hyperty-panel');

  let hi = '<p>Hyperty Reporter URL: ' + result.runtimeHypertyURL + '</p>';

  hypertyPanel.append(hi);


  let hello = $('.hello-panel');

  let sayHelloTo = '<form class="say-hello"> Hyperty URL: <input class="to-hyperty-input" type="text" name="toHyperty"><br><input type="submit" value="Say Hello"></form>'

  hello.append(sayHelloTo);

  $('.say-hello').on('submit', sayHello);
}


function sayHello(event) {

  event.preventDefault();

  let toHypertyForm = $(event.currentTarget);

  let toHyperty = toHypertyForm.find('.to-hyperty-input').val();

  console.log(toHyperty);

  hyperty.hello(toHyperty).then(function(helloObject) {

    console.log('helloUrl: ', helloObject);

    $('.hello-panel').hide();

    var helloUrl = '<p>Hello URL: '+ helloObject.url + '</p>';

    let bye = $('.bye-panel');

    let msgPanel = $('.msg-panel');

    msgPanel.append(helloUrl);

    bye.removeClass('hide');

    $('.say-bye').on('submit', sayBye);


  }).catch(function(reason) {
    console.error(reason);
  });

}

function sayBye() {

  event.preventDefault();

  let byeForm = $(event.currentTarget);

  let message = byeForm.find('.message-input').val();

  hyperty.bye(message);

  let msgPanel = $('.msg-panel');

  msgPanel.append('Bye Msg: ', message);

  let bye = $('.bye-panel');

  bye.addClass('hide');

}


Handlebars.getTemplate = function(name) {

  return new Promise(function(resolve, reject) {

    if (Handlebars.templates === undefined || Handlebars.templates[name] === undefined) {
      Handlebars.templates = {};
    } else {
      resolve(Handlebars.templates[name]);
    }

    $.ajax({
      url: 'templates/' + name + '.hbs',
      success: function(data) {
        Handlebars.templates[name] = Handlebars.compile(data);
        resolve(Handlebars.templates[name]);
      },

      fail: function(reason) {
        reject(reason);
      }
    });

  });

}
