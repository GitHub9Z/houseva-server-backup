var gulp = require('gulp');

// const mincss = require('gulp-mini-css');
const uglify = require('gulp-uglify');
const rev = require('gulp-rev');
const revCollector = require('gulp-rev-collector');
const htmlmin = require('gulp-htmlmin');
var clean = require('gulp-clean');
var gulpSequence = require('gulp-sequence');
var cleanCSS = require('gulp-clean-css');
var del = require('del');
// var run = require('gulp-run-command').default

var src_dir = './app/public/src';
var dest_dir = './app/public/dist';

// 源／目标 路径配置
var src_css = src_dir + '/css';
var src_js = src_dir + '/js';

var exclude_js = src_dir + '/js/thirdparty/*.js';
var exclude_css = src_dir + '/css/thirdparty/*.css';

var src_css_path = src_css + '/**/*.css';
var src_js_path = src_js + '/**/*.js';

var dest_css = dest_dir + '/css';
var dest_js = dest_dir + '/js';

var src_html_files = src_dir + '/view/**/*.html';
var dest_html = dest_dir + '/view'

var dest_rev = dest_dir + '/rev';
// rev配置，revJson ?
var rev_config = { //use rev to reset html resource url
    revJson: dest_dir + "/rev/**/*.json",
    src: "*.html", //root index.html
    dest: ""
};

gulp.task('clean', function() {
    return del([dest_dir + '/'])
});

// gulp.task('clean', function() {
//     return gulp.src(dest_dir + '/', {read: false}).pipe(clean({force: true}));
// });


gulp.task('cp_image', function () {
    gulp.src(src_dir + '/image/*')
        .pipe(gulp.dest(dest_dir + '/image'));
});

// gulp.task('cp_html', function () {
//     gulp.src(src_html_files)
//         .pipe(gulp.dest(dest_html));
// });

gulp.task('cp_exclude_css', function () {
    gulp.src(exclude_css, {
        base: src_dir + '/css',
    })
    .pipe(gulp.dest(dest_css));
});

// 复制jquery.js时有bug
gulp.task('cp_exclude_js', function () {
    gulp.src(exclude_js, {
        base: src_dir + '/js',
    })
    .pipe(gulp.dest(dest_js));
});


/**
 * minify html
 */
gulp.task('minify_html', function() {
    return gulp.src(src_html_files).pipe(htmlmin({
        collapseWhitespace: true,
        removeComments: true,
    })).pipe(gulp.dest(dest_html));
});

// gulp.task('mincss', function () {
//     gulp.src(src_css_path)
//         .pipe(mincss())
//         .pipe(gulp.dest(dest_css));
// });

// gulp.task('minjs', function () {
//     gulp.src(src_js_path)
//         .pipe(uglify())
//         .pipe(gulp.dest(dest_js));
// });


 
  
/**
 * Revision all asset files and
 * write a manifest file
 */
gulp.task('revision_css', function() {
    return gulp.src([src_css_path, '!' + exclude_css])
      .pipe(cleanCSS())
      .pipe(rev())
      .pipe(gulp.dest(dest_css))
      .pipe(rev.manifest())
      .pipe(gulp.dest(dest_rev + '/css'));
});

 
gulp.task('revision_js', function() {
    return gulp.src([src_js_path, '!' + exclude_js])
      .pipe(rev())
      .pipe(uglify().on('error', function(e) {
          console.log(e);
      }))
      .pipe(gulp.dest(dest_js))
      .pipe(rev.manifest())
      .pipe(gulp.dest(dest_rev + '/js'));
});


gulp.task('replace', function () {
    return gulp.src([dest_rev + '/**/*.json', src_html_files])
        .pipe( revCollector({
            replaceReved: true,
            // dirReplacements: {
            //     'css': '/dist/css',
            //     '/js/': '/dist/js/',
            //     'cdn/': function(manifest_value) {
            //         return '//cdn' + (Math.floor(Math.random() * 9) + 1) + '.' + 'exsample.dot' + '/img/' + manifest_value;
            //     }
            // }
        }) )
        // .pipe( minifyHTML({
        //         empty:true,
        //         spare:true
        //     }) )
        .pipe( gulp.dest(dest_html) );
});


gulp.task('watch', function () {
    gulp.watch(src_css_path, ['revision_css', 'replace']);
    gulp.watch(src_js_path, ['revision_js', 'replace']);
});


gulp.task('sequence',  
    gulpSequence('clean', 'cp_image', 'cp_exclude_css', 'cp_exclude_js', 
    'minify_html', 'revision_css', 'revision_js', 'replace')
);


gulp.task('default',function(){
    gulp.run('sequence');
    // gulp.run('watch');
});