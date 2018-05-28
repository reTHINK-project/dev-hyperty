// jshint browser:true, jquery: true
// jshint varstmt: false

let observer;

function hypertyLoaded(result) {

  console.log('LearningPlayer hyperty loaded!! ', result);

  observer = result.instance;

  observer.retrieveQuizzes('data://sharing-cities-dsm/elearning').then((result) => {

    console.info('[LearningPlayerDemo] quizzes: ', result);


  }).catch((reason) => {
    console.info('[LearningPlayerDemo] start failed | ', reason);
  });
}


