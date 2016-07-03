/*
 * Plugins
 */

 // General Plugins
var gulp = require('gulp');
var del = require('del');
var rename = require('gulp-rename');
var plumber = require('gulp-plumber');
var size = require('gulp-size');
var notify = require("gulp-notify")
var sourcemaps = require('gulp-sourcemaps');

// CSS Plugins
var cleanCSS = require('gulp-clean-css');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var nanocss = require('gulp-cssnano');
var mmq = require('gulp-merge-media-queries');

// JS Plugins
var watchify = require('watchify');
var browserify = require('browserify');
var babelify = require('babelify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var gutil = require('gulp-util');

// Image Plugins
var imagemin = require('gulp-imagemin');

/*
 * Paths object
 */
var paths = {
  srcAssets: 'src/assets/',
  devAssets: 'dev/assets/',
  buildAssets: 'build/assets/'
}

/*
 * Handle errors
 */
function handleError(error) {
  var message = error;
  if (typeof error === 'function' ) { return; }
  if (typeof error === 'object' && error.hasOwnProperty('message')) { message = error.message; }
  if (message !== undefined) { console.log('Error: ' + message); }
}

/*
 * Clean
 */
gulp.task('clean', function() {
  return del(['dev', 'build']);
});

/*
 * CSS
 */
gulp.task('css', function() {
  gulp.src(paths.srcAssets + 'scss/main.scss')
    .pipe(plumber({
        errorHandler: function (err) {
            console.log(err);
            this.emit('end');
        }
    }))
    .pipe(sourcemaps.init())
    .pipe(sass())
    .pipe(autoprefixer({
            browsers: ['last 2 versions'],
            cascade: false
        }))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(paths.devAssets + 'css/'))
    .pipe(notify({message: 'CSS compiled!', onLast: true}))
});

/*
 * JS
 */

 // the compileJS() does the actual JS compilation
function compileJS(watch) {

  var bundler = watchify(browserify(paths.srcAssets + 'js/main.js', {
    debug: true,
    extensions: ['js']
  }).transform(babelify.configure({
      presets: ["es2015"]
    }))
  );

  function rebundle() {
    bundler.bundle()
      .on('error', function(err) {
        console.error(err);
        this.emit('end'); }
      )
      .pipe(source('main.js'))
      .pipe(buffer())
      .pipe(sourcemaps.init({ loadMaps: true }))
      .pipe(sourcemaps.write('./'))
      .pipe(gulp.dest(paths.devAssets + 'js'))
      .pipe(notify({message: 'JS compiled!', onLast: true}))
  }

  // if the watch parameter is passed a true argument, then activate watching
  if (watch) {
    bundler.on('update', function() {
      console.log('-> bundling...');
      rebundle();
    });
  }

  rebundle();
}

// watchJS() will pass the true arg to compileJS() to activate watch
function watchJS() {
  return compileJS(true);
};

// The JS task calls the compileJS funciton
gulp.task('js', function() {
  return compileJS();
});



/*
 * Images
 */
gulp.task('img', function() {
  gulp.src(paths.srcAssets + 'img/**/*')
    .pipe(gulp.dest(paths.devAssets + 'img/'))
    .pipe(notify({message: 'Images compiled!', onLast: true}))
});

/*
 * Watch
 */
gulp.task('watch', function(error) {
  gulp.watch(paths.srcAssets + 'scss/**/*', ['css']);
  gulp.watch(paths.srcAssets + 'js/**/*', ['js']);
  gulp.watch(paths.srcAssets + 'img/**/*', ['img']);

  watchJS();
});

/*
 * Build
 */
gulp.task('build', function() {
  console.log('Ready to go!');
});

/*
 * Default task -
 */
gulp.task('default', ['watch', 'css', 'js', 'img']);