function getTemplate(path, script) {

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
