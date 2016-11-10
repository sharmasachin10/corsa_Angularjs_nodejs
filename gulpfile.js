var browserify = require('browserify');
var gulp = require('gulp');
var uglify = require('gulp-uglify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var nodemon = require('gulp-nodemon');
var browserSync = require('browser-sync');
var reload = browserSync.reload;
var htmlmin = require('gulp-htmlmin');
var minify = require('gulp-minify');
var concat = require('gulp-concat');
var rename = require('gulp-rename');

gulp.task('browserify', function() {
     // Grabs the app.js file
     return browserify('./angular/app.js')
     // bundles it and creates a file called main.js
     .bundle()
     .pipe(source('front.js'))
     // saves it the public/js/ directory
     .pipe(gulp.dest('./public/javascripts/front/'));
});

// gulp.task('browserify', function() {
//   return browserify('./angular/app.js')
//     .bundle()
//     .pipe(source('front.js')) // gives streaming vinyl file object
//     .pipe(buffer()) // <----- convert from streaming to buffered vinyl file object
//     .pipe(uglify()) // now gulp-uglify works
//     .pipe(gulp.dest('./public/javascripts/'));
// });


gulp.task('MinifyWebJS', function() {
    return gulp.src('./public/javascripts/front/angularjs/*.js')
        .pipe(concat('webMin.js'))
        .pipe(gulp.dest('./public/javascripts/front/'))
        .pipe(rename('webMin.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('./public/javascripts/front/'));
});

gulp.task('watch', function() {
     gulp.watch('angular/**/*.js', ['browserify'])
});

gulp.task('start', function () {
     nodemon({
          script: 'bin/www'
          //  , ext: 'js html'
          , env: { 'NODE_ENV': 'local' }
     })
})

// gulp.task('browser-sync', ['start'], function() {
//   browserSync({
//     proxy: "localhost:3000",  // local node app address
//     port: 5000,  // use *different* port than above
//     notify: true
//   });
// });
//
// gulp.task('default', ['browser-sync'], function () {
//   //gulp.watch(['./public/javascripts/front/angularjs/*.js'], reload);
//   gulp.watch('angular/**/*.js', ['browserify'], reload)
// });

gulp.task('default', ['start','browserify', 'watch'])
//gulp.task('default', ['browserify'])



//
// var browserify = require('browserify');
// var gulp = require('gulp');
// var uglify = require('gulp-uglify');
// var source = require('vinyl-source-stream');
// var buffer = require('vinyl-buffer');
// var nodemon = require('gulp-nodemon');
// var htmlmin = require('gulp-htmlmin');
// var minify = require('gulp-minify');
// var concat = require('gulp-concat');
// var rename = require('gulp-rename');
// var browserSync = require('browser-sync');
// var docco = require('gulp-docco');
//
// gulp.task('browserify', function() {
//      // Grabs the app.js file
//      return browserify('./angular/app.js')
//      // bundles it and creates a file called main.js
//      .bundle()
//      .pipe(source('front.js'))
//      // saves it the public/js/ directory
//      .pipe(gulp.dest('./public/javascripts/front/'));
// });
//
// // gulp.task('browserify', function() {
// //   return browserify('./angular/app.js')
// //     .bundle()
// //     .pipe(source('front.js')) // gives streaming vinyl file object
// //     .pipe(buffer()) // <----- convert from streaming to buffered vinyl file object
// //     .pipe(uglify()) // now gulp-uglify works
// //     .pipe(gulp.dest('./public/javascripts/'));
// // });
//
//
// gulp.task('MinifyWebJS', function() {
//     return gulp.src('./public/javascripts/front/angularjs/*.js')
//         .pipe(concat('webMin.js'))
//         .pipe(gulp.dest('./public/javascripts/front/'))
//         .pipe(rename('webMin.min.js'))
//         .pipe(uglify())
//         .pipe(gulp.dest('./public/javascripts/front/'));
// });
//
// gulp.task('watch', function() {
//      gulp.watch('angular/**/*.js', ['browserify', 'browser-sync'])
// });
//
// gulp.task('start', function () {
//      nodemon({
//           script: 'bin/www'
//           //  , ext: 'js html'
//           , env: { 'NODE_ENV': 'local' }
//      })
// })
//
// // Generate documentation pages and save into `docs` directory.
// gulp.task('docs', function () {
//        return
//        gulp.src('./public/javascripts/front/angularjs/*.js')
//        .pipe(docco())
//        .pipe(gulp.dest('docs'));
// });
//
// gulp.task('browser-sync', function() {
//     browserSync.init({
//         server: {
//             baseDir: "./public/javascripts/front/angularjs"
//         }
//     });
// });
//
//
// gulp.task('default', ['browser-sync'], function () {
//   // Watched tasks are run in parallel, not in series.
//   gulp.watch(['./public/javascripts/front/angularjs/*.js'], ['start', 'watch', browserSync.reload]);
// });
// //gulp.task('default', ['browserify'])
//
