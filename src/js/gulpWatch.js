(function () {
    try {
        var reloading = false;
        const gulp = require('gulp');
        const reload = () => {
            if (!reloading) {
                reloading = true;
                const {getCurrentWindow} = require('electron').remote;
                getCurrentWindow().reload();
            }
        };
        gulp.watch(['./data/theme*.css', './index.html', './data/bundle.js', './data/js/**.js', './data/node_requires/**/*.js'], reload);
    } catch (e) { void 0; }
})();
