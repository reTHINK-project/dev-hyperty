module.exports = function (config) {
    'use strict';
    config.set({

        basePath: '',

        frameworks: ['browserify','mocha'],

        browserify: {
            debug: true,
            configure: function(bundle) {
            bundle.once('prebundle', function() {
                  bundle.transform('babelify').plugin('proxyquire-universal');
                });
            }
        },

        client:{
            mocha: {
                timeout: 0
            }
        },

        files: [
            'test/*.spec.js'
        ],

        preprocessors: {
            'test/*.spec.js': 'browserify'
        },

        reporters: ['progress'],

        port: 9876,
        colors: true,
        autoWatch: true,
        singleRun: false,

        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_DEBUG,

        browsers: ['Chrome']

    });
};
