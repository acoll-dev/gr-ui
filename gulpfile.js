var gulp = require('gulp'),
    stylus = require('gulp-stylus'),
    sourcemaps = require('gulp-sourcemaps'),
    rename = require('gulp-rename'),
    bootstrap = require('bootstrap-styl'),
    gutil = require('gulp-util');

gulp.task('compile-stylus', function(){
    gulp.src(['**/stylus/source/**/*.styl', '!**/node_modules/**', '!**/bootstrap.styl'])
        .pipe(sourcemaps.init())
        .pipe(stylus({
            compress: false
        }))
        .pipe(rename(function(path){
            path.dirname = path.dirname.replace('stylus/source', '') + '/css';
        }))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('./'));
});

gulp.task('compile-stylus-bootstrap', function(){
    gulp.src(['**/bootstrap.styl'])
        .pipe(sourcemaps.init())
        .pipe(stylus({
            compress: true,
            use: [bootstrap()]
        }))
        .pipe(rename(function(path){
            path.dirname = path.dirname.replace('stylus/source', '') + '/css';
        }))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('./'));
});

gulp.task('watch-stylus', function(){
    gulp.watch(['**/*.styl', '!**/bootstrap.styl'], ['compile-stylus'])
});

gulp.task('watch-stylus-bootstrap', function(){
    gulp.watch(['**/bootstrap.styl'], ['compile-stylus-bootstrap'])
});

gulp.task('default', ['watch-stylus', 'watch-stylus-bootstrap']);
