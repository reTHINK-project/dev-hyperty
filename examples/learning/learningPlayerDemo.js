// jshint browser:true, jquery: true
// jshint varstmt: false

let elearningPlayer;

function hypertyLoaded(result) {

  console.log('LearningPlayer hyperty loaded!! ', result);

  elearningPlayer = result.instance;

  elearningPlayer.retrieveQuizzes('data://sharing-cities-dsm/elearning').then((result) => {

    console.info('[LearningPlayerDemo] quizzes: ', result);

    elearningPlayer._resumeReporters().then((result) => {

      console.log('[LearningPlayerDemo] resume ', result);

      if (result.length === 0 ) {
        elearningPlayer.invite('hyperty://sharing-cities-dsm/elearning').then(() => {
          console.log('[LearningPlayerDemo] invited "hyperty://sharing-cities-dsm/elearning"');
        });
      }



      elearningPlayer.initQuizSubmission();
  
    }).catch((reason) => {
      console.info('[LearningPlayerDemo] start failed | ', reason);
    });

  
  }).catch((reason) => {
    console.info('[LearningPlayerDemo] start failed | ', reason);
  });

}


