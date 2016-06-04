/* 
 *  FiMaJe, gestion du concours
 * 
 *  Creative Commons 
 *  Attribution - Pas d’Utilisation Commerciale 3.0 France 
 *  http://creativecommons.org/licenses/by-nc/3.0/fr/
 * 
 *  Auteurs: Sylvain Gamel, club « La Compagnie des Trolls » Antibes, France
 * 
 */

// ===== CONFIGURATION

var target_dir = "./public";

var source_js  = "./src/js";
var source_css = "./src/scss";

var destination_css = target_dir + "/css";
var destination_js  = target_dir + "/js";

var karmaConf = "karma.conf.js"


// ===== DEPENDENCIES

var gulp = require('gulp');

var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var del = require('del');

var concat = require('gulp-concat');
var copy = require('gulp-copy');


// ===== DEFAULT TASK


gulp.task('default', [ 'clean', 'build' ]);

// ===== CSS

gulp.task('css-libs', function () {
  return gulp.src([
      __dirname + '/node_modules/tether/dist/css/tether*.min.css',
      __dirname + '/node_modules/bootstrap/dist/css/bootstrap.min.css*'
  ])
    .pipe(gulp.dest(destination_css));
});



gulp.task('sass', function () {
  return gulp.src(source_css+'/**/*.scss')
    .pipe(sourcemaps.init())
    .pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(destination_css));
});
 
 
gulp.task('sass:watch', function () {
  gulp.watch(source_css+'/**/*.scss', [ 'sass' ]);
});


gulp.task('clean:css', function () {
  return del([
    destination_css
  ]);
});

gulp.task('build:css', [ "sass", "css-libs" ]);


// ===== JAVASCRIPT


gulp.task('js-libs', function () {
  return gulp.src([
      __dirname + '/node_modules/jquery/dist/jquery.min.js',
      __dirname + '/node_modules/tether/dist/js/tether.min.js',
      __dirname + '/node_modules/bootstrap/dist/js/bootstrap.min.js'
  ])
    .pipe(gulp.dest(destination_js));
});


gulp.task('copy-js-src-contest', function () {
  return gulp.src(source_js+'/contest/*.js')
    .pipe(concat('FiMaJe-contest.js'))
    .pipe(gulp.dest(destination_js));
    //.pipe(copy(destination_js, { prefix: 3 }));
});


gulp.task('build:javascript', [ 'js-libs', 'copy-js-src-contest' ]);


gulp.task('clean:javascript', function () {
  return del([
    destination_js
  ]);
});


// ====== UNIT TESTS

var UTServer = require('karma').Server;

gulp.task('karma', function(done) {
  new UTServer({
    configFile: __dirname + "/" + karmaConf,
    singleRun: false,
  }, done).start();
});



// ====== UI UNIT TESTS

// TODO

// ====== BUILD

gulp.task('build', [ 'build:css', 'build:javascript' ]);


// ====== CLEAN

gulp.task('clean', [ 'clean:css', 'clean:javascript' ]);

// ====== TESTS

gulp.task('test', [ 'karma' ]);
