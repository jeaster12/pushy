var gulp          = require('gulp'),
    browserSync   = require('browser-sync'),
    prefix        = require('gulp-autoprefixer'),
    cleanCSS      = require('gulp-clean-css'),
    deploy        = require('gulp-gh-pages'),    
    notify        = require('gulp-notify'),
    plumber       = require('gulp-plumber'),
    prompt        = require('gulp-prompt'),
    minimist      = require('minimist'); 
    rename        = require('gulp-rename'),
    sass          = require('gulp-sass'),
    sourcemaps    = require('gulp-sourcemaps'),
    stylelint     = require('gulp-stylelint'), 
    runSequence   = require('run-sequence'),
    reload        = browserSync.reload,
    del           = require('del'),
    vinylPaths    = require('vinyl-paths'),
    colors        = require('colors'),
    fileExists    = require('file-exists');
    download      = require('gulp-downloader');    

var bases = {
    app:  'src/',
    dist: 'dist/',
};

colors.setTheme({
  silly:   'rainbow',
  input:   'grey',
  verbose: 'cyan',
  prompt:  'grey',
  info:    'green',
  data:    'grey',
  help:    'cyan',
  warn:    'yellow',
  debug:   'blue',
  error:   'red'
});

var displayError = function(error) {
  // Initial building up of the error
  var errorString = '[' + error.plugin.error.bold + ']';
  errorString += ' ' + error.message.replace("\n",''); // Removes new line at the end

  // If the error contains the filename or line number add it to the string
  if(error.fileName)
      errorString += ' in ' + error.fileName;

  if(error.lineNumber)
      errorString += ' on line ' + error.lineNumber.bold;

  // This will output an error like the following:
  // [gulp-sass] error message in file_name on line 1
  console.error(errorString);
}

var onError = function(err) {
  notify.onError({
    title:    "Gulp",
    subtitle: "Failure!",
    message:  "Error: <%= error.message %>",
    sound:    "Basso"
  })(err);
  this.emit('end');
};

var sassOptions = {
  outputStyle: 'expanded'
};

var prefixerOptions = {
  browsers: ['last 2 versions']
};

// BUILD SUBTASKS
// ---------------

gulp.task('clean:dist', function() {
  return gulp.src(bases.dist)
    .pipe(vinylPaths(del));
});


gulp.task('styles', function() {
  return gulp.src(bases.app + 'scss/buttons.scss')
    .pipe(plumber({errorHandler: onError}))
    .pipe(sourcemaps.init())
    .pipe(sass(sassOptions))
    .pipe(prefix(prefixerOptions))    
    .pipe(rename('buttons.css'))
    .pipe(sourcemaps.write('maps'))
    .pipe(gulp.dest(bases.dist))
    .pipe(reload({stream:true}))    
});



gulp.task('styles:build', function() {
  return gulp.src(bases.dist + '*.css')
    .pipe(cleanCSS())
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest(bases.dist))
});

gulp.task('browser-sync', function() {
  browserSync({
    server: {
      baseDir: bases.dist
    }
  });
});

gulp.task('deploy', function() {
  return gulp.src(bases.dist + '**/*.*')
    .pipe(deploy());
});



gulp.task('lint', function() {
  return gulp.src('./src/scss/**/*.scss')
    .pipe(stylelint({
      failAfterError: true,
      reportOutputDir: 'reports/lint',
      reporters: [
        {formatter: 'verbose', console: true},
        {formatter: 'json', save: 'lint-report.json'}
      ],
      debug: true
    }));
});


gulp.task('html', function() {
  gulp.src(bases.app + './*.html')
    .pipe(gulp.dest(bases.dist))
    .pipe(reload({stream:true}));
});

gulp.task('watch', function() {
  gulp.watch(bases.app + 'scss/**/*.scss', ['styles']);
  gulp.watch(bases.app + './*.html', ['html']);
});



// BUILD TASKS
// ------------

gulp.task('default', function(done) {
  runSequence('clean:dist', 'html', 'styles', 'styles:build', 'browser-sync', 'watch', done);
});

gulp.task('build', function(done) {
  runSequence('clean:dist', 'html', 'styles', 'styles:build', done);
});