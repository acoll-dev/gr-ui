'use strict';
 
var gulp = require('gulp');
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var minifyCss = require('gulp-minify-css');
var cssGlobbing = require('gulp-css-globbing');
 
gulp.task('sass', function () {
  gulp.src('./client/layers/website/templates/default/scss/source/*.scss')
    .pipe(cssGlobbing({
      extensions: ['.scss'],
      autoReplaceBlock: {
        onOff: false,
        globBlockBegin: 'cssGlobbingBegin',
        globBlockEnd: 'cssGlobbingEnd',
        globBlockContents: './**/*.scss'
      },
      scssImportPath: {
        leading_underscore: false,
        filename_extension: false
      }
    }))
    .pipe(sourcemaps.init())
    .pipe(sass().on('error', sass.logError))
    .pipe(minifyCss())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('./client/layers/website/templates/default/css'));
});
 
gulp.task('sass:watch', function () {
  gulp.watch('./**/*.scss', ['sass']);
});

gulp.task('default', ['sass:watch']);