function templateAreReady(name) {

  // var script = document.createElement('script');
  // script.onload = function () {
  //     //do stuff with the script
  //     console.log('materialize:');
  // };
  //
  // script.src = 'https://cdnjs.cloudflare.com/ajax/libs/materialize/0.97.7/js/materialize.min.js';
  //
  // document.head.appendChild(script);

  Handlebars.getTemplate = function(path) {

   console.log('Get template: ', path, name);

   if (path.indexOf(name) != -1) {
     path = path.replace(name + '/', 'https://rawgit.com/reTHINK-project/dev-hyperty/master/examples/' + name + '/');
   } else {
     path = './' + path;
   }

   console.log('Get template: ', path);

   return new Promise(function(resolve, reject) {

     if (Handlebars.templates === undefined || Handlebars.templates[path] === undefined) {
       Handlebars.templates = {};
     } else {
       resolve(Handlebars.templates[path]);
     }

     $.ajax({
       url: path + '.hbs',
       success: function(data) {
         Handlebars.templates[path] = Handlebars.compile(data);
         resolve(Handlebars.templates[path]);
       },

       fail: function(reason) {
         reject(reason);
       }
     });

   });
  };

  serialize();

}


function getTemplate(path, script) {

  console.log('Get template: ', path);

  return new Promise(function(resolve, reject) {

    if (Handlebars.templates === undefined || Handlebars.templates[name] === undefined) {
      Handlebars.templates = {};
    } else {
      resolve(Handlebars.templates[name]);
    }

    let templateFile = $.ajax({
      url: path + '.hbs',
      success: function(data) {
        Handlebars.templates[name] = Handlebars.compile(data);
      },

      fail: function(reason) {
        return reason;
      }
    });

    let scriptFile = $.getScript(script);

    let requests = [];
    if (path) requests.push(templateFile);
    if (script) requests.push(scriptFile);

    Promise.all(requests).then(function(result) {
      resolve(Handlebars.templates[name]);
    }).catch(function(reason) {
      reject(reason);
    });

  });
}
