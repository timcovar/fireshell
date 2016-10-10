import gulp from 'gulp';
import concat from 'gulp-concat';
import wrap from 'gulp-wrap';
import uglify from 'gulp-uglify';
import htmlmin from 'gulp-htmlmin';
import gulpif from 'gulp-if';
import sass from 'gulp-sass';
import postcss from 'gulp-postcss';
import sourcemaps from 'gulp-sourcemaps';
import autoprefixer from 'autoprefixer';
import yargs from 'yargs';
import ngAnnotate from 'gulp-ng-annotate';
import templateCache from 'gulp-angular-templatecache';
import server from 'browser-sync';
import del from 'del';
import path from 'path';
import child from 'child_process';

const exec = child.exec;
const argv = yargs.argv;
const root = 'src/';
const paths = {
  dist: './dist/',
  scripts: [`${root}/app/**/*.js`, `!${root}/app/**/*.spec.js`],
  tests: `${root}/app/**/*.spec.js`,
  styles: `${root}/sass/*.scss`,
  allstyles: `${root}/sass/**/*.scss`,
  templates: `${root}/app/**/*.html`,
  modules: [
    'jquery/dist/jquery.min.js',
    'angular/angular.js',
    'angular-ui-router/release/angular-ui-router.js',
    'angular-animate/angular-animate.js',
    'bootstrap-sass/assets/javascripts/bootstrap.min.js',
    'angular-ui-bootstrap/dist/ui-bootstrap-tpls.js',
    'angular-loading-bar/build/loading-bar.min.js'
  ],
  static: [
    `${root}/index.html`,
    `${root}/fonts/**/*`,
    `${root}/img/**/*`
  ]
};
const browsers = ["Android 2.3",
  "Android >= 4",
  "Chrome >= 20",
  "Firefox >= 24",
  "Explorer >= 8",
  "iOS >= 6",
  "Opera >= 12",
  "Safari >= 6"];

server.create();

gulp.task('clean', cb => del(paths.dist + '**/*', cb));

gulp.task('templates', () => {
  return gulp.src(paths.templates)
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(templateCache({
      root: 'app',
      standalone: true,
      transformUrl: function (url) {
        return url.replace(path.dirname(url), '.');
      }
    }))
    .pipe(gulp.dest('./'));
});

gulp.task('modules', ['templates'], () => {
  return gulp.src(paths.modules.map(item => 'node_modules/' + item))
    .pipe(concat('vendor.js'))
    .pipe(gulpif(argv.deploy, uglify()))
    .pipe(gulp.dest(paths.dist + 'js/'));
});

gulp.task('styles', () => {
  return gulp.src(paths.styles)
    .pipe(sass({outputStyle: 'compressed', precision: 8}))
    .pipe(gulp.dest(paths.dist + 'csspre/'));
});

gulp.task('autoprefixer', ['styles'], () => {
    return gulp.src(paths.dist + 'csspre/*.css')
        .pipe(sourcemaps.init())
        .pipe(postcss([ autoprefixer({ browsers: browsers}) ]))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(paths.dist + 'css/'));
});

gulp.task('scripts', ['modules'], () => {
  return gulp.src([
      `!${root}/app/**/*.spec.js`,
      `${root}/app/**/*.module.js`,
      ...paths.scripts,
      './templates.js'
    ])
    .pipe(wrap('(function(angular){\n\'use strict\';\n<%= contents %>})(window.angular);'))
    .pipe(concat('bundle.js'))
    .pipe(ngAnnotate())
    .pipe(gulpif(argv.deploy, uglify()))
    .pipe(gulp.dest(paths.dist + 'js/'));
});

gulp.task('serve', () => {
  return server.init({
    files: [`${paths.dist}/**`],
    port: 4000,
    server: {
      baseDir: paths.dist
    }
  });
});

gulp.task('copy', ['clean'], () => {
  return gulp.src(paths.static, { base: 'src' })
    .pipe(gulp.dest(paths.dist));
});

gulp.task('watch', ['serve', 'scripts'], () => {
  gulp.watch([paths.scripts, paths.templates], ['scripts']);
  gulp.watch(paths.allstyles, ['styles', 'autoprefixer']);
});

gulp.task('default', [
  'copy',
  'styles',
  'autoprefixer',
  'serve',
  'watch'
]);