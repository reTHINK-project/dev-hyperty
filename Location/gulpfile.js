// jshint varstmt:false
var gulp = require('gulp');

// Task and dependencies to distribute for all environments;
var babel = require('babelify');
var browserify = require('browserify');
var buffer = require('vinyl-buffer');
var source = require('vinyl-source-stream');
var replace = require('gulp-replace');
var uglify = require('gulp-uglify');
var Base64 = require('js-base64').Base64;
var prompt = require('gulp-prompt');
var through = require('through2');
var fs = require('fs');

var pkg = require('./package.json');
var resources_path = "test/resources/resources";
var code_path = "src";

/**
 * Compile on specific file from ES6 to ES5
 * @param  {string} 'compile' task name
 *
 * How to use: gulp compile --file=path/to/file;
 */
gulp.task('compile', function() {

  var filename = argv.file;
  var path;

  if (!filename) {
    this.emit('end');
  } else {
    var splitIndex = filename.lastIndexOf('/') + 1;
    path = filename.substr(0, splitIndex);
    filename = filename.substr(splitIndex).replace('.js', '');
  }

  console.log('Converting ' + filename + ' on ' + path + ' to ES5');

  var bundler = browserify(path + filename, {
    standalone: 'activate',
    debug: true
  }).transform(babel);

  function rebundle() {
    return bundler.bundle()
      .on('error', function(err) {
        console.error(err);
        this.emit('end');
      })
      .pipe(source(filename + '.ES5.js'))
      .pipe(buffer())
      .pipe(uglify())
      .pipe(gulp.dest(path));
  }

  return rebundle();

});

function encode(filename, descriptorName, configuration, isDefault) {

  var descriptor = fs.readFileSync(resources_path + '/descriptors/' + descriptorName + '.json', 'utf8');
  var json = JSON.parse(descriptor);

  return through.obj(function(file, enc, cb) {

    if (file.isNull()) {
      return cb(null, file);
    }
    if (file.isStream()) {
      return cb(new Error('Streaming not supported'));
    }

    var encoded = Base64.encode(file.contents);
    var value = 'default';

    if (isDefault) {
      value = 'default';
    } else {
      value = filename;
    }

    if (!json.hasOwnProperty(value)) {
      var newObject = {};
      json[value] = newObject;
      json[value].sourcePackage = {};
    }

    var language = 'javascript';
    if (descriptorName === 'DataSchemas') {
      language = 'JSON-Schema';
    }

    json[value].cguid = Math.floor(Math.random() + 1);
    json[value].type = descriptorName;
    json[value].version = '0.1';
    json[value].description = 'Description of ' + filename;
    json[value].objectName = filename;
    json[value].configuration = configuration;
    json[value].sourcePackageURL = '/sourcePackage';
    json[value].sourcePackage.sourceCode = encoded;
    json[value].sourcePackage.sourceCodeClassname = filename;
    json[value].sourcePackage.encoding = 'base64';
    json[value].sourcePackage.signature = '';
    json[value].language = language;
    json[value].signature = '';
    json[value].messageSchemas = '';
    json[value].dataObjects = [];
    json[value].accessControlPolicy = 'somePolicy';

    var newDescriptor = new Buffer(JSON.stringify(json, null, 2));
    console.log(value);
    cb(null, newDescriptor);

  });

}

function resource(file, configuration, isDefault) {

  var filename = file;
  var splitIndex = filename.lastIndexOf('/') + 1;
  var extension = filename.substr(filename.lastIndexOf('.') + 1);

  switch (extension) {
    case 'js':
      filename = filename.substr(splitIndex).replace('.js', '');
      break;
    case 'json':
      filename = filename.substr(splitIndex).replace('.json', '');
      break;
  }

  var descriptorName;
  if (filename.indexOf('Hyperty') !== -1) {
    descriptorName = 'Hyperties';
  } else if (filename.indexOf('ProtoStub') !== -1) {
    descriptorName = 'ProtoStubs';
  } else if (filename.indexOf('DataSchema')) {
    descriptorName = 'DataSchemas';
  }

  console.log('DATA:', descriptorName);

  if (extension === 'js') {
    return browserify({
      entries: [code_path + '/' + filename + '.js'],
      standalone: 'activate',
      debug: false
    })
    .transform(babel,{ global:true, compact: false})
    .bundle()
    .pipe(source('bundle.js'))
    .pipe(replace('g.activate = f()', 'g.activate = f().default'))
    .pipe(gulp.dest( resources_path + '/'))
    .pipe(buffer())
    .pipe(encode(filename, descriptorName, configuration, isDefault))
    .pipe(source(descriptorName + '.json'))
    .pipe(gulp.dest(resources_path + '/descriptors/'));
  } else if (extension === 'json') {

    return gulp.src([code_path + '/' + filename + '.json'])
    .pipe(gulp.dest( resources_path + '/'))
    .pipe(buffer())
    .pipe(encode(filename, descriptorName, configuration, isDefault))
    .pipe(source(descriptorName + '.json'))
    .pipe(gulp.dest(resources_path + '/descriptors/'));

  }

}

gulp.task('encode', function(done) {

  var files = [];
  var dirFiles = fs.readdirSync(code_path);
  files = dirFiles.filter(isFile);
  files = files.map(function(file) {
    return code_path + '/' + file;
  });

  function isFile(file) {
    if (file.indexOf('Hyperty') !== -1 || file.indexOf('ProtoStub') !== -1 || file.indexOf('DataSchema') !== -1) {
      return fs.statSync(code_path + '/' + file).isFile();
    }
  }

  gulp.src('./', {buffer:false})
    .pipe(prompt.prompt([{
      type: 'list',
      name: 'file',
      message: 'File to be converted:',
      choices: files
    },
    {
      type: 'input',
      name: 'configuration',
      message: 'ProtoStub Configuration, use something like:\n{"url": "wss://msg-node.localhost:9090/ws"}\nConfiguration:',
      validate: function(value) {
        try {
          JSON.parse(value);
          return true;
        } catch (e) {
          console.error('Check your configuration JSON\nShould be something like:\n{"url": "wss://msg-node.localhost:9090/ws"}');
          return false;
        }
      }
    },
    {
      type: 'list',
      name: 'defaultFile',
      message: 'This will be a default file to be loaded?',
      choices: ['yes', 'no']
    }], function(res) {

      fs.access(res.file, fs.R_OK | fs.W_OK, function(err) {
        if (err) done(new Error('No such file or directory'));
        return;
      });

      var configuration = JSON.parse(res.configuration);

      var isDefault = true;
      if (res.defaultFile === 'no' || res.defaultFile === 'n') {
        isDefault = false;
      }

      if (res.file) {
        resource(res.file, configuration, isDefault);
      }
    })
  );
});
