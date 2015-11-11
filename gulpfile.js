var gulp = require('gulp'),
    gif = require('gulp-if'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
    sourcemaps = require('gulp-sourcemaps'),
	rename = require("gulp-rename"),
	replace = require('gulp-replace'),
    htmlify = require('gulp-minify-html'),
    cssify = require('gulp-minify-css'),
	uncss = require('gulp-uncss'),
	russian = require('translit-russian'),
	translit = require('translit')(russian);

var project = ""; //Project name please...

var assets = {
    js : [
      project + '/js/jquery-2.1.0.min.js',
      project + '/js/bootstrap.js',
	  project + '/js/jqBootstrapValidation.js',
      project + '/js/blocs.js',
	  project + 'js/formHandler.js'
    ],
    html :  project + '/*.html',
    css : [
      project + '/css/*.css',
      project + '/style.css'
    ]
};

var notMapping = false;
var notMinifiedHtml = true;
var notUnUsedCss = true;

var notMinifiedJs = function (file) {
    return !/\.min\.js/.test(file.path);
};

var notMinifiedCss = function (file) {
    return !/\.min\.css/.test(file.path);
};

var ignored = [/\w\.in/,
                    ".fade",
                    ".collapse",
                    ".collapsing",
                    /(#|\.)navbar(\-[a-zA-Z]+)?/,
                    /(#|\.)dropdown(\-[a-zA-Z]+)?/,
                    /(#|\.)(open)/,
					/modal|lightbox/,
                    ".modal",
                    ".modal.fade.in",
                    ".modal-dialog",
                    ".modal-document",
                    ".modal-scrollbar-measure",
                    ".modal-backdrop.fade",
                    ".modal-backdrop.in",
                    ".modal.fade.modal-dialog",
                    ".modal.in.modal-dialog",
                    ".modal-open",
                    ".in",
                    ".modal-backdrop",
					".close"
				];

gulp.task('js', function(){
    gulp.src(assets.js)
    .pipe(concat('build.js'))
    .pipe(uglify())
    .pipe(gulp.dest(project + '/build/js'))
});

gulp.task('css', function(){
    gulp.src(assets.css)
    .pipe(gif(notMapping, sourcemaps.init()))
    .pipe(concat('build.css'))
	.pipe(gif(notUnUsedCss, uncss({html: [project + "/build/*.html"], ignore : ignored})))
    .pipe(cssify())
    .pipe(gif(notMapping, sourcemaps.write()))
	.pipe(replace("img/", "../img/"))
    .pipe(gulp.dest(project + '/build/css'))
});

gulp.task('html', function(){
	var menus = [];
    gulp.src(assets.html)
    .pipe(gif(notMinifiedHtml, htmlify()))
	.pipe(replace("<link rel=stylesheet type=text/css href=./css/bootstrap.css><link rel=stylesheet id=ppstyle type=text/css href=style.css><link rel=stylesheet href=./css/animate.css><link rel=stylesheet href=./css/font-awesome.min.css>", "<link rel=stylesheet href=css/build.css>"))
	.pipe(replace("<script src=./js/jquery-2.1.0.min.js></script><script src=./js/bootstrap.js></script><script src=./js/blocs.js></script>", ""))
	.pipe(replace("<script src=./js/jqBootstrapValidation.js></script><script src=./js/formHandler.js></script>", ""))
	.pipe(replace("</body>", "<script src=js/build.js></script></body>"))
	.pipe(rename(function(path){
		path.basename = translit(path.basename);
	}))
	.pipe(replace(/<a href=((?!http|#).*?)\.html/g, function(str) {
		return translit(str);
	}))
    .pipe(gulp.dest(project + '/build'))
});

gulp.task('watch', function(){
    gulp.watch(assets.html, ['html']);
    gulp.watch(assets.js, ['js']);
    gulp.watch(assets.css, ['css']);
});
