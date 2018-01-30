import React, { Component } from 'react';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/map';
import './App.css';
// load scripts
import Script from 'react-load-script'
import $ from 'jquery';


var rethink;

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
      loadHypertyObs()
    });
}

/**
* Function to load the HelloWorldObserver Hyperty
*/
function loadHypertyObs()
{
  RUNTIME.requireHyperty(hypertyURI(hyperty_domain, 'HelloWorldObserver')).then((hyperty) => {
    console.log('[HelloWorldDemo.loadHypertyObs', hyperty);
    hypertyObserver = hyperty;
    $('.observer-info').append('<p>Deployed</p>');
    hypertyDeployed(hypertyObserver);
  });
}


/**
  * Call back after hyperty is loaded
  */
function hypertyDeployed(result) {
  let hypertyObserver;

  hypertyObserver = result.instance;

  console.log('[HelloWorldDemo.hypertyDeployed] ',hypertyObserver);

  $('.observer-info').append('<p>URL: ' + result.runtimeHypertyURL + '</p>');

  // Add an invitation Callback
  hypertyObserver.addEventListener('invitation', function(identity) {

    console.log('[HelloWorldDemo] Invitation received from:', JSON.stringify(identity));

    $('.observer-msg-panel').append('<p>Invitation Received from:' + identity.userProfile.username + '</p>');


  });


  /**
  Hello event from Reporter
  **/
  hypertyObserver.addEventListener('hello', function(event) {

    console.log('[HelloWorldDemo] Hello received from:', event.hello);


    $('.observer-msg-panel').append('<p>' + event.hello + '</p>');

  });

  console.log('Observer Waiting for Hello!!');

}


class ReactObserver extends Component{
  // We define some intial state for the component
  state = {
    todos: [],
    input: '',
  };



  componentDidMount() {

  }

  handleScriptCreate(){
    console.log("Script create");
  }

  handleScriptError(){
    console.log("Script error");

  }

  handleScriptLoad(){
    console.log("Script load");
    if (window.rethink)
    {
      rethink = window.rethink
    }
    console.log(rethink);
  }

  render() {
    // We render the interface, bind callbacks from the input field and the "add to list" button to our Subjects and display the todos in a list below
    return (
      <div className="App-intro">
        <Script
          url="https://hybroker.rethink.ptinovacao.pt/.well-known/runtime/rethink.js"
          onCreate={this.handleScriptCreate.bind(this)}
          onError={this.handleScriptError.bind(this)}
          onLoad={this.handleScriptLoad.bind(this)}
        />
        <div className="row card-panel teal lighten-4">
          <div className="col s12" id="observer-panel">
            <div className="observer-info"></div>
            <div className="observer-evt"></div>
            <div className="card-panel teal lighten-5 observer-msg-panel"></div>
          </div>
        </div>


        </div>
      );
    }
  }

  export default ReactObserver;
