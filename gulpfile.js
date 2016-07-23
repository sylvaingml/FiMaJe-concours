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
var source_fa  = "./src/font-awesome";
var source_img = "./src/img";

var destination_css   = target_dir + "/css";
var destination_js    = target_dir + "/js";
var destination_fonts = target_dir + "/fonts";
var destination_img   = target_dir + "/img";

var karmaConf = "karma.conf.js";


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

gulp.task('fontawesome-css', function () {
  return gulp.src([
      source_fa + '/css/**.css'
  ])
    .pipe(gulp.dest(destination_css));
});

gulp.task('fontawesome-fonts', function () {
  return gulp.src([
      source_fa + '/fonts/*'
  ])
    .pipe(gulp.dest(destination_fonts));
});

gulp.task('fontawesome', [ "fontawesome-css", "fontawesome-fonts" ]);

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
 
 
gulp.task('clean:css', function () {
  return del([
    destination_css
  ]);
});

gulp.task('build:css', [ "sass", "css-libs", "fontawesome" ]);


gulp.task('sass:watch', function () {
  gulp.watch(source_css+'/**/*.scss', [ 'sass' ]);
});



gulp.task('build:css:watch', [ "build", "sass:watch" ]);

// ===== ASSETS

gulp.task('build-images', function () {
  return gulp.src([
      source_img+'/**/*.jpeg'
    ])
    .pipe(gulp.dest(destination_img));
});

 gulp.task('build:assets', [ "build-images" ]);

gulp.task('build:assets:watch', function () {
  gulp.watch([
      source_img+'/**/*.jpeg' 
  ], [ 'build:assets' ]);
});

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
});

gulp.task('copy-js-src-contest-vote', function () {
  return gulp.src(source_js+'/contest-vote/*.js')
    .pipe(concat('FiMaJe-contest-vote.js'))
    .pipe(gulp.dest(destination_js));
});

gulp.task('copy-js-src-admin', function () {
  return gulp.src(source_js+'/admin/*.js')
    .pipe(concat('FiMaJe-admin.js'))
    .pipe(gulp.dest(destination_js));
});


gulp.task('build:javascript', [ 
    'js-libs', 
    'copy-js-src-contest', 'copy-js-src-contest-vote', 'copy-js-src-admin' 
]);

gulp.task('build:javascript:watch', function () {
  gulp.watch([
      source_js+'/**/*.js' 
  ], [ 'build:javascript' ]);
});


gulp.task('clean:javascript', function () {
  return del([
    destination_js
  ]);
});


// ====== UNIT TESTS

gulp.task('karma', function(done) {
    var UTServer = require('karma').Server;

    new UTServer({
        configFile: __dirname + "/" + karmaConf,
        singleRun: false
    }, done).start();
});



// ====== UI UNIT TESTS

// ...TODO

// ===== PRODUCTION DEPLOYMENT

gulp.task('deploy', [ 'build' ]);

// ===== BUILD

gulp.task('build', [ 'build:css', 'build:javascript', 'build:assets' ]);
gulp.task('build-continuous', [ 'build:css:watch', 'build:javascript:watch', 'build:assets:watch' ]);


// ===== CLEAN

gulp.task('clean', [ 'clean:css', 'clean:javascript' ]);

// ===== TESTS

gulp.task('test', [ 'karma' ]);
