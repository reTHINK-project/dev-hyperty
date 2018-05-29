// jshint browser:true, jquery: true
// jshint varstmt: false

let elearningPlayer;

function hypertyLoaded(result) {

  console.log('LearningPlayer hyperty loaded!! ', result);

  elearningPlayer = result.instance;

  elearningPlayer.retrieveQuizzes('data://sharing-cities-dsm/elearning').then((result) => {

    console.info('[LearningPlayerDemo] quizzes: ', result);


  }).catch((reason) => {
    console.info('[LearningPlayerDemo] start failed | ', reason);
  });

  elearningPlayer._resumeReporters().then((result) => {

    elearningPlayer.initQuizSubmission();

    
    

  }).catch((reason) => {
    console.info('[LearningPlayerDemo] start failed | ', reason);
  });
}


