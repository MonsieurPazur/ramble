const {
  src, dest, parallel, watch,
} = require('gulp');
const sass = require('gulp-sass');

function css() {
  return src('src/sass/*.scss')
    .pipe(sass())
    .pipe(dest('dist/css'));
}

function watchFiles() {
  watch('src/sass/*.scss', css);
}

exports.css = css;
exports.default = parallel(css, watchFiles);
