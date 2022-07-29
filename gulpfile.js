const gulp = require('gulp');
const rename = require('gulp-rename');
const cleanCSS = require('gulp-clean-css');
const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
const concat = require('gulp-concat');
const sass = require('gulp-sass')(require('sass'));
const sourcemaps = require('gulp-sourcemaps');
const autoprefixer = require('gulp-autoprefixer');
const htmlmin = require('gulp-htmlmin');
const size = require('gulp-size');
const browserSync = require('browser-sync').create();
const fileinclude = require('gulp-file-include');

const paths = {
	styles: {
		src: 'src/scss/**/*.scss',
		dest: 'dist/css/',
	},
	scripts: {
		src: 'src/js/**/*.js',
		dest: 'dist/js/'
	},
	images: {
		src: 'src/images/**',
		dest: 'dist/images/',
	},
	html: {
		src: ['src/html/**/*.html', '!src/html/components/**'],
		dest: 'dist',
	},
};

// function clean() {
// 	return del(['dist'])
// }

function styles() {
	return gulp.src(paths.styles.src)
		.pipe(sourcemaps.init())
		.pipe(sass().on('error', sass.logError))
		.pipe(autoprefixer({
			cascade: false
		}))
		.pipe(cleanCSS({
			level: 2,
			compatibility: 'ie8'
		}))
		.pipe(rename({
			basename: 'styles',
			suffix: '.min'
		}))
		.pipe(size({
			showFiles: true
		}))
		.pipe(sourcemaps.write())
		.pipe(gulp.dest(paths.styles.dest))
		.pipe(browserSync.stream());
}

function scripts() {
	return gulp.src(paths.scripts.src, {
		sourcemaps: true,
	})
		.pipe(sourcemaps.init())
		.pipe(babel({
			presets: ['@babel/env']
		}))
		.pipe(uglify())
		.pipe(concat('scripts.min.js'))
		.pipe(size({
			showFiles: true
		}))
		.pipe(sourcemaps.write())
		.pipe(gulp.dest(paths.scripts.dest))
		.pipe(browserSync.stream());
}

function images() {
	return gulp.src(paths.images.src)
		.pipe(gulp.dest(paths.images.dest))
}

function html() {
	return gulp.src(paths.html.src)
		.pipe(htmlmin({
			collapseWhitespace: false
		}))
		.pipe(size({
			showFiles: true
		}))
		.pipe(fileinclude({
			prefix: '@@',
			basepath: '@file',
		}))
		.pipe(gulp.dest(paths.html.dest))
		.pipe(browserSync.stream());
}

function watch() {
	browserSync.init({
		server: {
			baseDir: './dist/'
		},
		port: '9000',
		open: false,
	});

	gulp.watch(paths.html.dest).on('change', browserSync.reload);
	gulp.watch(paths.html.src, html);
	gulp.watch('src/html/components/**', html);
	gulp.watch(paths.images.src, images);
	gulp.watch(paths.scripts.src, scripts);
	gulp.watch(paths.styles.src, styles);
}

const build = gulp.series(html, gulp.parallel(styles, scripts, images));

exports.watch = watch;
exports.default = watch;
exports.build = build;
