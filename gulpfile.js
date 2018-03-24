var browserSync = require("browser-sync").create();
var gulp = require("gulp");
var size = require('gulp-size');
var sourcemaps = require("gulp-sourcemaps");

// for html
var htmlmin = require("gulp-htmlmin");
var twig = require("gulp-twig");

// for css
var autoprefixer = require("autoprefixer");
var cssnano = require("cssnano");
var postcss = require("gulp-postcss");
var postscss = require("postcss-scss");
var purifycss = require("gulp-purifycss");
var sass = require("gulp-sass");
var stylelint = require('stylelint');

// for images
var imagemin = require("gulp-imagemin");

gulp.task("default", ["build"], function() {
    browserSync.init({
        server: {
            baseDir: "./dist"
        }
    });

    // watch html files to reload browser
    gulp.watch(["src/*.html", "src/**/*.html"], ["html"]);

    // watch styles folder to compile sass files
    gulp.watch(["src/styles/*.scss", "src/styles/**/*.scss"], ["sass"]);
});

gulp.task("build", ["html", "sass", "images"])

// compile html files
gulp.task("html", function () {
    gulp.src("src/*.html")
        // process template
        .pipe(twig())
        // minimize html files
        .pipe(htmlmin({
            collapseWhitespace: true
        }))
        // copy to dist folder
        .pipe(gulp.dest("dist"))
        /// and reload browsers
        .pipe(browserSync.stream());
});

// compile css styles from sass files
gulp.task("sass", ["sass:lint"], function () {
    var plugins = [
        // add prefixes to old browsers compatibility
        autoprefixer(),
        // compress compiled css
        cssnano()
    ];
    gulp.src("src/styles/*.scss")
        // capture sourcemaps
        .pipe(sourcemaps.init())
        // compile sass
        .pipe(sass().on("error", sass.logError))
        .pipe(size({
            showFiles: true
        }))
        .pipe(size({
            gzip: true,
            showFiles: true
        }))
        .pipe(purifycss(["src/js/*.js", "src/js/**/*.js", "src/*.html", "src/components/*.html", "src/layouts/*.html", "src/includes/*.html"]))
        .pipe(postcss(plugins, { syntax: postscss }))
        .pipe(size({
            showFiles: true
        }))
        .pipe(size({
            gzip: true,
            showFiles: true
        }))
        // save sourcemaps in css folder
        .pipe(sourcemaps.write("./"))
        // copy to dist folder
        .pipe(gulp.dest("dist/css/"))
        // and reload browsers
        .pipe(browserSync.stream());
});

// lint scss styles
gulp.task("sass:lint", function () {
    gulp.src(["src/styles/*.scss", "src/styles/**/*.scss", "!src/styles/components/_icons.scss"])
        .pipe(postcss([
            // lint style files
            stylelint()
        ]))
});

// images
gulp.task("images", function() {
    gulp.src(["src/images/*", "src/images/**/*"])
        .pipe(imagemin())
        .pipe(gulp.dest("dist/img/"));
});
