/*
 * This is the Hello World App demo that uses the Hello World Reporter and Observer Hyperties
 *
 */

let RUNTIME;
let hypertyObserver = null;
let hypertyReporter = null;
const hypertyURI = (hyperty_domain, hyperty) => `hyperty-catalogue://catalogue.${hyperty_domain}/.well-known/hyperty/${hyperty}`;
let runtime_domain = 'hybroker.rethink.ptinovacao.pt';
let hyperty_domain = 'hybroker.rethink.ptinovacao.pt';
let toHyperty;
let firstContactRemote = true;

let config = {
  domain: hyperty_domain,
  development: false,
  runtimeURL: `hyperty-catalogue://catalogue.${runtime_domain}/.well-known/runtime/Runtime`
};

console.log('runtime config: ', config);

$(window).on( "load", function() {
  console.log('ready');

  loadRuntime();
});

/**
* Function to load the Runtime
*/

function loadRuntime()
{
  var start = new Date().getTime();
  //Rethink runtime is included in index.html
  rethink.default.install(config).then((runtime) => {
      RUNTIME = runtime
      loadHypertyRep();
    });
}


/**
* Function to load the HelloWorldReporter Hyperty
*/

function loadHypertyRep(){
  RUNTIME.requireHyperty(hypertyURI(hyperty_domain, 'HelloWorldReporter')).then((hyperty) => {
    hypertyReporter = hyperty;
    console.log('[HelloWorldDemo.loadHypertyRep] loaded: ',hyperty);
    $('.reporter-info').append('<p>Deployed</p>');
    $('.reporter-info').append('<p>URL: ' + hyperty.runtimeHypertyURL + '</p>');
    fillSayHelloToRemoteHyperty();
  });
}

function fillSayHelloToRemoteHyperty()
{
  let hello = $('.hello-panel');

  if(firstContactRemote) {
    let sayHelloTo = '<form class="say-hello"> Hyperty URL: <input class="to-hyperty-input" type="text" name="toHyperty"><br><input type="submit" value="Say Hello"></form>'

    hello.append(sayHelloTo);

    $('.say-hello').on('submit', sayHelloToRemoteHyperty);
    firstContactRemote = false;
  }
  else {
    hello.removeClass('hide');
  }

}

function sayHelloToRemoteHyperty(event) {
  event.preventDefault();
  console.log('event->',event);

  let toHypertyForm = $(event.currentTarget);

  toHyperty = toHypertyForm.find('.to-hyperty-input').val();

  console.log(toHyperty);

  hypertyReporter.instance.hello(toHyperty).then(function(helloObject) {
    $('.runtime-panel').append('<p><b>'
    +' Event: Hello sent to Remote Hyperty <br>'+
    '<hr style="border:1px solid;"/></b></p>');
    $('.reporter-evt').append('<p>Observer Url: '+ toHyperty+'</p>');
    let bye = $('.bye-panel');
    let hello = $('.hello-panel');
    hello.addClass('hide');
      bye.append('<a  onclick="fillSayBye();"  class="waves-effect waves-light btn center-align">Say Bye.</li>') ;
  }).catch(function(reason) {
    console.error(reason);
  });
}


function fillSayBye(){

  let bye = $('.bye-panel');

  let say_bye = $('.say-bye');

  if (say_bye.length > 0) {
      $('btn-bye').hide();
  } else {
    let sayBye = '<form class="say-bye"> Message to Send: <input class="to-msg-input" type="text" name="toBye"><br><input type="submit" value="Send"></form>'
    bye.append(sayBye);
    $('.say-bye').on('submit', sayByeToHyperty);
  }
}

function sayByeToHyperty(event) {

  event.preventDefault();

  console.log('event->',event);

  let msgToSend = $(event.currentTarget).find('.to-msg-input').val();

  let bye = $('.bye-panel');
  bye.addClass('hide');
  hypertyReporter.instance.bye(msgToSend);
  $('.reporter-msg-panel').append('<p>'+msgToSend+'</p>');
}
