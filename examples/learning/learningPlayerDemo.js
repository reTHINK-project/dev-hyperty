// jshint browser:true, jquery: true
// jshint varstmt: false

let elearningPlayer;

function hypertyLoaded(result) {

  console.log('ElearningPlayer hyperty loaded!! ', result);

  elearningPlayer = result.instance;

  elearningPlayer.retrieveQuizzes('data://sharing-cities-dsm/elearning').then((result) => {

    console.info('[ElearningPlayerDemo] quizzes: ', result);

    elearningPlayer.initQuizSubmission().then(()=>{
      elearningPlayer.invite('hyperty://sharing-cities-dsm/elearning').then(() => {
        console.log('[ElearningPlayerDemo] invited "hyperty://sharing-cities-dsm/elearning"');
      });

    })

  
  }).catch((reason) => {
    console.info('[LearningPlayerDemo] start failed | ', reason);
  });

}


