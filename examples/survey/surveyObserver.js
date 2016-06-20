// jshint browser:true, jquery: true
// jshint varstmt: false
/* global Handlebars */
/* global Materialize */

var surveyInstance;
var surveyHy;
var avatar = 'https://lh3.googleusercontent.com/-XdUIqdMkCWA/AAAAAAAAAAI/AAAAAAAAAAA/4252rscbv5M/photo.jpg';

function hypertyLoaded(result) {

  let hypertyInfo = '<span class="white-text">' +
                    '<b>Name:</b> ' + result.name + '</br>' +
                    '<b>Status:</b> ' + result.status + '</br>' +
                    '<b>HypertyURL:</b> ' + result.runtimeHypertyURL + '</br>' +
                    '</span>';
  $('.card-panel').html(hypertyInfo);
  $('#send_response').on('click', sendResponse);

  surveyHy = result.instance;

  surveyHy.onRequest(processSurvey)
}

function processSurvey(survey) {
  surveyInstance = survey
  let surveyDiv = $('#survey');
  surveyDiv.html(JSON.stringify(survey.data))
}

function sendResponse(event){
    surveyInstance.answer(JSON.parse($('#answer').val()))
}
