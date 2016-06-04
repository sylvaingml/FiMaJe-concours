/* 
 *  Karma configuration
 * 
 *  FiMaJe, formulaire d'inscription de pièces
 * 
 *  Creative Commons 
 *  Attribution - Pas d’Utilisation Commerciale 3.0 France 
 *  http://creativecommons.org/licenses/by-nc/3.0/fr/
 * 
 *  Auteurs: Sylvain Gamel, club « La Compagnie des Trolls » Antibes, France
 * 
 */

module.exports = function(config)
{
    config.set({
        // base path that will be used to resolve all patterns (eg. files, exclude)
        basePath: '.',
        
        // frameworks to use
        // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
        frameworks: [ 'jasmine', 'fixture' ],
        
        // list of files / patterns to load in the browser
        files: [
            'node_modules/jquery/dist/jquery.min.js',
            'src/js/**/*.js',
            'tests/js/**/*.spec.js',
            // this file will be served on demand from disk and will be ignored by the watcher
            {
                pattern: 'tests/js/**/*.form.html'
            }
        ],
        
        // list of files to exclude
        exclude: [
        ],
        
        // preprocess matching files before serving them to the browser
        // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
        preprocessors: {
            '**/*.html': [ 'html2js' ]
        },
        
        // test results reporter to use
        // possible values: 'dots', 'progress'
        // available reporters: https://npmjs.org/browse/keyword/karma-reporter
        reporters: [ 'progress', 'kjhtml' ],
        
        plugins: [
            'karma-fixture',
            'karma-html2js-preprocessor',
            
            'karma-chrome-launcher',
            'karma-safari-launcher',
            
            'karma-jasmine',
            'karma-jasmine-html-reporter'
        ],
        
        // web server port
        port: 9876,
        
        // enable / disable colors in the output (reporters and logs)
        colors: true,
        
        // level of logging
        // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
        logLevel: config.LOG_INFO,
        
        // enable / disable watching file and executing tests whenever any file changes
        autoWatch: true,
        
        // start these browsers
        // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
        browsers: [ 'Chrome' ],
        
        // Continuous Integration mode
        // if true, Karma captures browsers, runs the tests and exits
        singleRun: false,
        
        // Concurrency level
        // how many browser should be started simultaneous
        concurrency: Infinity
    });
};
