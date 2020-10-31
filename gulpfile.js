"use strict";

const gulp = require("gulp"),
  plumber = require("gulp-plumber"),
  sourcemap = require("gulp-sourcemaps"),
  less = require("gulp-less"),
  postcss = require("gulp-postcss"),
  autoprefixer = require("autoprefixer"),
  server = require("browser-sync").create(),
  webp = require("gulp-webp"),
  csso = require("gulp-csso"),
  rename = require("gulp-rename"),
  imagemin = require("gulp-imagemin"),
  del = require("del"),
  htmlmin = require("gulp-htmlmin"),
  npmDist = require("gulp-npm-dist");

gulp.task("css", function () {
  return gulp.src("source/less/style.less")
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(less())
    .pipe(postcss([
      autoprefixer()
    ]))
    .pipe(csso())
    .pipe(rename("style.min.css"))
    .pipe(sourcemap.write("."))
    .pipe(gulp.dest("build/css"))
    .pipe(server.stream());
});

gulp.task("html", () => {
  return gulp.src("source/*.html")
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest("build"));
});

gulp.task("server", function () {
  server.init({
    server: "build/",
    notify: false,
    open: true,
    cors: true,
    ui: false
  });

  gulp.watch("source/less/**/*.less", gulp.series("css"));
  gulp.watch("source/js/**/*.js", gulp.series("build", "refresh"));
  gulp.watch("source/*.html", gulp.series("build", "refresh"));
});

gulp.task("webp", function () {
  return gulp.src("source/img/**/*.{jpg,png}")
    .pipe(webp({quality: 90}))
    .pipe(gulp.dest("source/img"));
});

gulp.task("images", function () {
  return gulp.src("source/img/**/*.{png,jpg,svg}")
    .pipe(imagemin([
      imagemin.optipng({optimizationLevel: 3}),
      imagemin.mozjpeg({progressive: true}),
      imagemin.svgo()
    ]))
    .pipe(gulp.dest("source/img"));
});

gulp.task("copy", function () {
  return gulp.src([
    "source/fonts/**/*.{woff,woff2}",
    "source/img/**",
    "source/js/**/*.js",
    "source/*.ico"
  ], {
    base: "source"
  })
    .pipe(gulp.dest("build"));
});

gulp.task("copy:libs", function() {
  return gulp.src(npmDist(),
    {base:"node_modules"})
    .pipe(gulp.dest("build/libs"));
});

gulp.task("clean", function () {
  return del("build");
});

gulp.task("refresh" ,function (done) {
  server.reload();
  done();
});


gulp.task("build", gulp.series("clean", "copy", "copy:libs", "html", "css"));
gulp.task("start", gulp.series("build", "server"));
