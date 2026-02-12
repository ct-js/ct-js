(function gulpWatch() {
    try {
        var reloading = false;
        const gulp = require('gulp');
        const path = require('path');
        nw.Window.get().showDevTools();
        const getTagName = src => path.basename(src, path.extname(src));
        const reload = () => {
            if (!reloading) {
                reloading = true;
                nw.Window.get().reload();
            }
        };
        gulp.watch(['./index.html', './data/bundle.js'], reload);

        const themeWatcher = gulp.watch(['./data/theme*.css']);
        themeWatcher.on('change', src => {
            const incoming = src.split(/[/\\]/).pop();
            if (incoming === `theme${localStorage.UItheme}.css`) {
                 // For some reason Windows returns empty files from time to time w/o a delay
                setTimeout(() => {
                    const link = document.getElementById('themeCSS');
                    link.href = link.href.replace(/\?.*|$/, '?' + Date.now());
                    window.alertify.success('Updated theme ✅');
                }, 100);
            }
        });

        const translationsWatcher = gulp.watch(['./data/i18n/*.json']);
        translationsWatcher.on('change', src => {
            const incoming = src.split(/[/\\]/).pop();
            if (incoming === `${localStorage.appLanguage}.json`) {
                 // For some reason Windows returns empty files from time to time w/o a delay
                setTimeout(() => {
                    const {loadLanguage} = require('src/node_requires/i18n.ts');
                    try {
                        loadLanguage(localStorage.appLanguage);
                        window.signals.trigger('updateLocales');
                        window.riot.update();
                        window.alertify.success('Updated the current i18n file ✅');
                    } catch (e) {
                        alertify.alert('Could not open a language file: ' + e);
                    }
                }, 100);
            }
        });

        const tagWatcher = gulp.watch(['./data/hotLoadTags/**/*.js']);
        const onChange = src => {
            const fs = require('fs-extra');
            const riotTag = getTagName(src);
            fs.readFile(src, 'utf8')
            .then(script => {
                // eslint-disable-next-line no-console
                console.log(`[riot] Updating ${riotTag} tag…`);
                nw.Window.get().showDevTools();
                try {
                    // eslint-disable-next-line no-eval
                    eval(script);
                    riot.reload(riotTag);
                    alertify.success(`Updated ${riotTag} tag.`);
                } catch (err) {
                    alertify.error(`Could not update ${riotTag} tag. See the console for details.`);
                    throw err;
                }
            });
        };
        tagWatcher.on('change', onChange);
        tagWatcher.on('add', onChange);
    } catch (e) {
        void 0;
    }
})();
