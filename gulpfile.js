'use strict';

/* eslint no-console: 0 */
const path = require('path'),
      gulp = require('gulp'),
      concat = require('gulp-concat'),
      replace = require('gulp-replace'),
      sourcemaps = require('gulp-sourcemaps'),
      minimist = require('minimist'),
      ts = require('gulp-typescript'),
      stylus = require('gulp-stylus'),
      riot = require('gulp-riot'),
      pug = require('gulp-pug'),
      sprite = require('gulp-svgstore'),
      globby = require('globby'),
      filemode = require('filemode'),
      zip = require('gulp-zip'),

      jsdocx = require('jsdoc-x'),

      streamQueue = require('streamqueue'),
      notifier = require('node-notifier'),
      fs = require('fs-extra'),

      spawnise = require('./node_requires/spawnise');

/**
 * To download NW.js binaries from a different place (for example, from live builds),
 * do the following:
 *
 * 1) Publish a customNwManifest.json with the needed version as its latest one.
 *    See https://nwjs.io/versions.json
 * 2) Set nwSource to the directory with a folder for this version.
 *    For example, if your binaries for each platform are at
 *    https://dl.nwjs.io/live-build/nw50/20201223-162000/6a3f52427/v0.50.3/,
 *    then you should specify the URL
 *    https://dl.nwjs.io/live-build/nw50/20201223-162000/6a3f52427/.
 * 3) Set nwVersion to `undefined` so that nw-builder loads the needed version from
 *    the created manifest and downloads it from a given source.
 *
 * For some reason, setting nwVersion to a specific version doesn't work, even with
 * a custom manifest.
 *
 * Also note that you may need to clear the `ct-js/cache` folder.
 */
const nwSource = void 0;
const nwManifest = void 0;
const nwVersion = '0.51.2',
      platforms = ['osx64', 'win32', 'win64', 'linux32', 'linux64'],
      nwFiles = ['./app/**', '!./app/export/**', '!./app/projects/**', '!./app/exportDesktop/**', '!./app/cache/**', '!./app/.vscode/**', '!./app/JamGames/**'];

const argv = minimist(process.argv.slice(2));
const npm = (/^win/).test(process.platform) ? 'npm.cmd' : 'npm';

const pack = require('./app/package.json');

var channelPostfix = argv.channel || false,
    fixEnabled = argv.fix || false,
    nightly = argv.nightly || false,
    buildNumber = argv.buildNum || false;

if (nightly) {
    channelPostfix = 'nightly';
}

let errorBoxShown = false;
const showErrorBox = function () {
    if (!errorBoxShown) {
        errorBoxShown = true;
        console.error(`
 ╭──────────────────────────────────────────╮
 │                                          ├──╮
 │             Build failed! D:             │  │
 │                                          │  │
 │  If you have recently pulled changes     │  │
 │  or have just cloned the repo, run this  │  │
 │  command in your console:                │  │
 │                                          │  │
 │  $ gulp -f devSetup.gulpfile.js          │  │
 │                                          │  │
 ╰─┬────────────────────────────────────────╯  │
   ╰───────────────────────────────────────────╯
`);
    }
};

const makeErrorObj = (title, err) => {
    showErrorBox();
    return {
        title,
        message: err.toString(),
        icon: path.join(__dirname, 'error.png'),
        sound: true,
        wait: true
    };
};

const fileChangeNotifier = p => {
    notifier.notify({
        title: `Updating ${path.basename(p)}`,
        message: `${p}`,
        icon: path.join(__dirname, 'cat.png'),
        sound: false,
        wait: false
    });
};

const compileStylus = () =>
    gulp.src('./src/styl/theme*.styl')
    .pipe(sourcemaps.init())
    .pipe(stylus({
        compress: true,
        'include css': true
    }))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('./app/data/'));

const compilePug = () =>
    gulp.src('./src/pug/*.pug')
    .pipe(sourcemaps.init())
    .pipe(pug({
        pretty: false
    }))
    .on('error', err => {
        notifier.notify(makeErrorObj('Pug failure', err));
        console.error('[pug error]', err);
    })
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('./app/'));

const riotSettings = {
    compact: false,
    template: 'pug'
};
const compileRiot = () =>
    gulp.src('./src/riotTags/**/*.tag')
    .pipe(riot(riotSettings))
    .pipe(concat('riotTags.js'))
    .pipe(gulp.dest('./app/data/'));

const compileRiotPartial = path => {
    console.log(`Updating tag at ${path}…`);
    return gulp.src(path)
    .pipe(riot(riotSettings))
    .pipe(gulp.dest('./app/data/hotLoadTags/'));
};

const concatScripts = () =>
    streamQueue(
        {
            objectMode: true
        },
        gulp.src('./src/js/3rdparty/riot.min.js'),
        gulp.src(['./src/js/**', '!./src/js/3rdparty/riot.min.js'])
    )
    .pipe(sourcemaps.init({
        largeFile: true
    }))
    .pipe(concat('bundle.js'))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('./app/data/'))
    .on('error', err => {
        notifier.notify({
            title: 'Scripts error',
            message: err.toString(),
            icon: path.join(__dirname, 'error.png'),
            sound: true,
            wait: true
        });
        console.error('[scripts error]', err);
    })
    .on('change', fileChangeNotifier);

const copyRequires = () =>
    gulp.src([
        './src/node_requires/**/*',
        '!./src/node_requires/**/*.ts'
    ])
    .pipe(sourcemaps.init())
    // ¯\_(ツ)_/¯
    .pipe(sourcemaps.mapSources((sourcePath) => '../../src/' + sourcePath))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('./app/data/node_requires'));

const tsProject = ts.createProject('tsconfig.json');

const processRequiresTS = () =>
    gulp.src('./src/node_requires/**/*.ts')
    .pipe(sourcemaps.init())
    .pipe(tsProject())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('./app/data/node_requires'));

const processRequires = gulp.series(copyRequires, processRequiresTS);

const copyInEditorDocs = () =>
    gulp.src('./docs/docs/ct.*.md')
    .pipe(gulp.dest('./app/data/node_requires'));

const compileScripts = gulp.series(compileRiot, concatScripts);

const makeIconAtlas = () =>
    gulp.src('./src/icons/**/*.svg', {
        base: './src/icons'
    })
    .pipe(sprite())
    .pipe(gulp.dest('./app/data'));

const writeIconList = () => fs.readdir('./src/icons')
    .then(files => files.filter(file => path.extname(file) === '.svg'))
    .then(files => files.map(file => path.basename(file, '.svg')))
    .then(files => fs.outputJSON('./app/data/icons.json', files));

const icons = gulp.series(makeIconAtlas, writeIconList);

const watchScripts = () => {
    gulp.watch('./src/js/**/*', gulp.series(compileScripts))
    .on('error', err => {
        notifier.notify(makeErrorObj('General scripts error', err));
        console.error('[scripts error]', err);
    })
    .on('change', fileChangeNotifier);
};
const watchRiot = () => {
    const watcher = gulp.watch('./src/riotTags/**/*', compileRiot);
    watcher.on('error', err => {
        notifier.notify(makeErrorObj('Riot failure', err));
        console.error('[pug error]', err);
    });
    watcher.on('change', compileRiotPartial);
};
const watchStylus = () => {
    gulp.watch('./src/styl/**/*', compileStylus)
    .on('error', err => {
        notifier.notify(makeErrorObj('Stylus failure', err));
        console.error('[styl error]', err);
    })
    .on('change', fileChangeNotifier);
};
const watchPug = () => {
    gulp.watch('./src/pug/**/*.pug', compilePug)
    .on('change', fileChangeNotifier)
    .on('error', err => {
        notifier.notify(makeErrorObj('Pug failure', err));
        console.error('[pug error]', err);
    });
};
const watchRequires = () => {
    gulp.watch('./src/node_requires/**/*', processRequires)
    .on('change', fileChangeNotifier)
    .on('error', err => {
        notifier.notify(makeErrorObj('Failure of node_requires', err));
        console.error('[node_requires error]', err);
    });
};
const watchIcons = () => {
    gulp.watch('./src/icons/**/*.svg', icons);
};

const watch = () => {
    watchScripts();
    watchStylus();
    watchPug();
    watchRiot();
    watchRequires();
    watchIcons();
};

const lintStylus = () => {
    const stylint = require('gulp-stylint');
    return gulp.src(['./src/styl/**/*.styl', '!./src/styl/3rdParty/**/*.styl'])
    .pipe(stylint())
    .pipe(stylint.reporter())
    .pipe(stylint.reporter('fail', {
        failOnWarning: true
    }));
};

const lintJS = () => {
    const eslint = require('gulp-eslint');
    return gulp.src([
        './src/js/**/*.js',
        '!./src/js/3rdparty/**/*.js',
        './src/node_requires/**/*.js',
        './app/data/ct.release/**/*.js',
        '!./app/data/ct.release/**/*.min.js',
        './src/pug/**/*.pug'
    ])
    .pipe(eslint({
        fix: fixEnabled
    }))
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
};
const lintTags = () => {
    const eslint = require('gulp-eslint'),
          replaceExt = require('gulp-ext-replace');
    return gulp.src(['./src/riotTags/**/*.tag'])
    .pipe(replaceExt('.pug')) // rename so that it becomes edible for eslint-plugin-pug
    .pipe(eslint()) // ESLint-pug cannot automatically fix issues
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
};

const lintI18n = () => require('./node_requires/i18n')().then(console.log);

const lint = gulp.series(lintJS, lintTags, lintStylus, lintI18n);

const processToPlatformMap = {
    'darwin-x64': 'darwin',
    'win32-x32': 'win32',
    'win32-x64': 'win64',
    'linux-x32': 'linux32',
    'linux-x64': 'linux64'
};
const launchApp = () => {
    const NwBuilder = require('nw-builder');
    const platformKey = `${process.platform}-${process.arch}`;
    if (!(platformKey in processToPlatformMap)) {
        throw new Error(`Combination of OS and architecture ${process.platform}-${process.arch} is not supported by NW.js.`);
    }
    const nw = new NwBuilder({
        files: nwFiles,
        version: nwVersion,
        downloadUrl: nwSource,
        manifestUrl: nwManifest,
        platforms: [processToPlatformMap[platformKey]],
        flavor: 'sdk'
    });
    return nw.run()
    .catch(error => {
        showErrorBox();
        console.error(error);
    })
    .then(launchApp);
};

const docs = async () => {
    try {
        await fs.remove('./app/data/docs/');
        await spawnise.spawn(npm, ['run', 'build'], {
            cwd: './docs'
        });
        await fs.copy('./docs/docs/.vuepress/dist', './app/data/docs/');
    } catch (e) {
        showErrorBox();
        throw e;
    }
};

// @see https://microsoft.github.io/monaco-editor/api/enums/monaco.languages.completionitemkind.html
const kindMap = {
    function: 'Function',
    class: 'Class'
};
const getAutocompletion = doc => {
    if (doc.kind === 'function') {
        if (!doc.params || doc.params.length === 0) {
            return doc.longname + '()';
        }
        return doc.longname + `(${doc.params.map(param => param.name).join(', ')})`;
    }
    if (doc.kind === 'class') {
        return doc.name;
    }
    return doc.longname;
};
const getDocumentation = doc => {
    if (!doc.description) {
        return void 0;
    }
    if (doc.kind === 'function') {
        return {
            value: `${doc.description}
${(doc.params || []).map(param => `* \`${param.name}\` (${param.type.names.join('|')}) ${param.description} ${param.optional ? '(optional)' : ''}`).join('\n')}

Returns ${doc.returns[0].type.names.join('|')}, ${doc.returns[0].description}`
        };
    }
    return {
        value: doc.description
    };
};

const bakeCompletions = () =>
    jsdocx.parse({
        files: './app/data/ct.release/**/*.js',
        excludePattern: '(DragonBones|pixi)',
        undocumented: false,
        allowUnknownTags: true
    })
    .then(docs => {
        const registry = [];
        for (const doc of docs) {
            console.log(doc);
            if (doc.params) {
                for (const param of doc.params) {
                    console.log(param);
                }
            }
            const item = {
                label: doc.name,
                insertText: doc.autocomplete || getAutocompletion(doc),
                documentation: getDocumentation(doc),
                kind: kindMap[doc.kind] || 'Property'
            };
            registry.push(item);
        }
        fs.outputJSON('./app/data/node_requires/codeEditor/autocompletions.json', registry, {
            spaces: 2
        });
    });
const bakeCtTypedefs = cb => {
    spawnise.spawn(npm, ['run', 'ctTypedefs'])
    .then(cb);
};
const concatTypedefs = () =>
    gulp.src(['./src/typedefs/ct.js/types.d.ts', './src/typedefs/ct.js/**/*.ts', './src/typedefs/default/**/*.ts'])
    .pipe(concat('global.d.ts'))
    // patch the generated output so ct classes allow custom properties
    .pipe(replace('declare class Copy extends PIXI.AnimatedSprite {', `
        declare class Copy extends PIXI.AnimatedSprite {
            [key: string]: any
        `))
    .pipe(replace('declare class Room extends PIXI.Container {', `
        declare class Room extends PIXI.Container {
            [key: string]: any
        `))
    // also, remove JSDOC's @namespace flags so the popups in ct.js become more clear
    .pipe(replace(`
 * @namespace
 */
declare namespace`, `
 */
declare namespace`))
    .pipe(replace(`
     * @namespace
     */
    namespace`, `
     */
    namespace`))
    .pipe(gulp.dest('./app/data/typedefs/'));

// electron-builder ignores .d.ts files no matter how you describe your app's contents.
const copyPixiTypedefs = () => gulp.src('./app/node_modules/pixi.js/pixi.js.d.ts')
    .pipe(gulp.dest('./app/data/typedefs'));

const bakeTypedefs = gulp.series([bakeCtTypedefs, concatTypedefs, copyPixiTypedefs]);


const build = gulp.parallel([
    compilePug,
    compileStylus,
    compileScripts,
    processRequires,
    copyInEditorDocs,
    icons,
    bakeTypedefs
]);

const bakePackages = async () => {
    const NwBuilder = require('nw-builder');
    // Use the appropriate icon for each release channel
    if (nightly) {
        await fs.copy('./buildAssets/icon.png', './app/ct_ide.png');
    } else {
        await fs.copy('./buildAssets/nightly.png', './app/ct_ide.png');
    }
    await fs.remove(path.join('./build', `ctjs - v${pack.version}`));
    var nw = new NwBuilder({
        files: nwFiles,
        platforms,
        version: nwVersion,
        flavor: 'sdk',
        buildType: 'versioned',
        // forceDownload: true,
        zip: false,
        macIcns: nightly ? './buildAssets/nightly.icns' : './buildAssets/icon.icns'
    });
    await nw.build();

    // Copy .itch.toml files for each target platform
    await Promise.all(platforms.map(platform => {
        if (platform.indexOf('win') === 0) {
            return fs.copy(
                './buildAssets/windows.itch.toml',
                path.join(`./build/ctjs - v${pack.version}`, platform, '.itch.toml')
            );
        }
        if (platform === 'osx64') {
            return fs.copy(
                './buildAssets/mac.itch.toml',
                path.join(`./build/ctjs - v${pack.version}`, platform, '.itch.toml')
            );
        }
        return fs.copy(
            './buildAssets/linux.itch.toml',
            path.join(`./build/ctjs - v${pack.version}`, platform, '.itch.toml')
        );
    }));
    console.log('Built to this location:', path.join('./build', `ctjs - v${pack.version}`));
};

// a workaround for https://github.com/nwjs-community/nw-builder/issues/289
const fixPermissions = () => {
    if (platforms.indexOf('osx64') === -1) {
        return Promise.resolve(); // skip the fix if not building for macos
    }
    const baseDir = path.posix.join('./build', `ctjs - v${pack.version}`, 'osx64', 'ctjs.app/Contents');

    const globs = [
        baseDir + '/MacOS/nwjs',
        baseDir + '/Versions/*/nwjs Framework.framework/Versions/A/nwjs Framework',
        baseDir + '/Versions/*/nwjs Helper.app/Contents/MacOS/nwjs Helper'
    ];
    return globby(globs)
    .then(files => {
        console.log('overriding permissions for', files);
        return Promise.all(files.map(file => filemode(file, '777')));
    });
};

const oldSymlink = fs.symlink;
fs.symlink = (target, destination) => {
    console.log('link', target, '<==', destination);
    return oldSymlink(target, destination);
};

const abortOnWindows = done => {
    if ((/^win/).test(process.platform) && platforms.indexOf('osx64') !== -1) {
        throw new Error('Sorry, but building ct.js for mac is not possible on Windows due to Windows\' specifics. You can edit `platforms` at gulpfile.js if you don\'t need a package for mac.');
    }
    done();
};
// Based on solution at https://github.com/strawbees/desktop-packager/blob/master/commands/darwin/bundle.js
const fixSymlinks = async () => {
    if (platforms.indexOf('osx64') === -1) {
        return; // skip the fix if not building for macos
    }
    const baseDir = path.posix.join('./build', `ctjs - v${pack.version}`, 'osx64', 'ctjs.app/Contents');

    // the actual directory depends on nw version, so let's find the needed dir with a glob
    const glob = baseDir + '/Versions/*/nwjs Framework.framework/*';
    const execute = require('./node_requires/execute');
    const frameworkDir = path.dirname((await globby([glob]))[0]);

    console.log('fixing symlinks at', frameworkDir);

    execute(async ({exec}) => {
        await exec(`
            cd "${frameworkDir}"
            rm "Versions/Current" && ln -s "./A" "./Versions/Current"
            rm "Helpers" && ln -s "./Versions/Current/Helpers"
            rm "Internet Plug-Ins" && ln -s "./Versions/Current/Internet Plug-Ins"
            rm "Libraries" && ln -s "./Versions/Current/Libraries"
            rm "nwjs Framework" && ln -s "./Versions/Current/nwjs Framework"
            rm "Resources" && ln -s "./Versions/Current/Resources"
            rm "XPCServices" && ln -s "./Versions/Current/XPCServices"
        `);
    });
};
exports.fixPermissions = fixPermissions;
exports.fixSymlinks = fixSymlinks;


let zipPackages;
if ((/^win/).test(process.platform)) {
    const zipsForAllPlatforms = platforms.map(platform => () =>
        gulp.src(`./build/ctjs - v${pack.version}/${platform}/**`)
        .pipe(zip(`ct.js v${pack.version} for ${platform}.zip`))
        .pipe(gulp.dest(`./build/ctjs - v${pack.version}/`)));
    zipPackages = gulp.parallel(zipsForAllPlatforms);
} else {
    const execute = require('./node_requires/execute');
    zipPackages = () => Promise.all(platforms.map(platform =>
        // `r` for dirs,
        // `q` for preventing spamming to stdout,
        // and `y` for preserving symlinks
        execute(({exec}) => exec(`
            cd "./build/ctjs - v${pack.version}/"
            zip -rqy "ct.js v${pack.version} for ${platform}.zip" "./${platform}"
        `))));
}


const examples = () => gulp.src('./src/examples/**/*')
    .pipe(gulp.dest('./app/examples'));

// eslint-disable-next-line valid-jsdoc
/**
 * @see https://stackoverflow.com/a/22907134
 */
const patronsCache = done => {
    const http = require('https');

    const dest = './app/data/patronsCache.csv',
          src = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTUMd6nvY0if8MuVDm5-zMfAxWCSWpUzOc81SehmBVZ6mytFkoB3y9i9WlUufhIMteMDc00O9EqifI3/pub?output=csv';
    const file = fs.createWriteStream(dest);
    http.get(src, response => {
        response.pipe(file);
        file.on('finish', () => {
            file.close(() => done()); // close() is async, call cb after close completes.
        });
    })
    .on('error', err => { // Handle errors
        fs.unlink(dest); // Delete the file async. (But we don't check the result)
        done(err);
    });
};

const packages = gulp.series([
    lint,
    abortOnWindows,
    build,
    docs,
    patronsCache,
    examples,
    bakePackages,
//    fixSymlinks,
//    fixPermissions,
    zipPackages
]);

const deployOnly = () => {
    console.log(`For channel ${channelPostfix}`);
    if (nightly) {
        return spawnise.spawn('./butler', ['push', `./build/ctjs - v${pack.version}/linux32`, `comigo/ct-nightly:linux32${channelPostfix ? '-' + channelPostfix : ''}`, '--userversion', buildNumber])
        .then(() => spawnise.spawn('./butler', ['push', `./build/ctjs - v${pack.version}/linux64`, `comigo/ct-nightly:linux64${channelPostfix ? '-' + channelPostfix : ''}`, '--userversion', buildNumber]))
        .then(() => spawnise.spawn('./butler', ['push', `./build/ctjs - v${pack.version}/osx64`, `comigo/ct-nightly:osx64${channelPostfix ? '-' + channelPostfix : ''}`, '--userversion', buildNumber]))
        .then(() => spawnise.spawn('./butler', ['push', `./build/ctjs - v${pack.version}/win32`, `comigo/ct-nightly:win32${channelPostfix ? '-' + channelPostfix : ''}`, '--userversion', buildNumber]))
        .then(() => spawnise.spawn('./butler', ['push', `./build/ctjs - v${pack.version}/win64`, `comigo/ct-nightly:win64${channelPostfix ? '-' + channelPostfix : ''}`, '--userversion', buildNumber]));
    }
    return spawnise.spawn('./butler', ['push', `./build/ctjs - v${pack.version}/linux32`, `comigo/ct:linux32${channelPostfix ? '-' + channelPostfix : ''}`, '--userversion', pack.version])
    .then(() => spawnise.spawn('./butler', ['push', `./build/ctjs - v${pack.version}/linux64`, `comigo/ct:linux64${channelPostfix ? '-' + channelPostfix : ''}`, '--userversion', pack.version]))
    .then(() => spawnise.spawn('./butler', ['push', `./build/ctjs - v${pack.version}/osx64`, `comigo/ct:osx64${channelPostfix ? '-' + channelPostfix : ''}`, '--userversion', pack.version]))
    .then(() => spawnise.spawn('./butler', ['push', `./build/ctjs - v${pack.version}/win32`, `comigo/ct:win32${channelPostfix ? '-' + channelPostfix : ''}`, '--userversion', pack.version]))
    .then(() => spawnise.spawn('./butler', ['push', `./build/ctjs - v${pack.version}/win64`, `comigo/ct:win64${channelPostfix ? '-' + channelPostfix : ''}`, '--userversion', pack.version]));
};

const deploy = gulp.series([packages, deployOnly]);

const launchDevMode = done => {
    watch();
    launchApp();
    done();
};
const launchDevModeNoNW = done => {
    watch();
    done();
};
const defaultTask = gulp.series(build, launchDevMode);
const devNoNW = gulp.series(build, launchDevModeNoNW);

exports.lintJS = lintJS;
exports.lintTags = lintTags;
exports.lintStylus = lintStylus;
exports.lintI18n = lintI18n;
exports.lint = lint;
exports.packages = packages;
exports.patronsCache = patronsCache;
exports.docs = docs;
exports.build = build;
exports.deploy = deploy;
exports.deployOnly = deployOnly;
exports.default = defaultTask;
exports.dev = devNoNW;
exports.bakeCompletions = bakeCompletions;
exports.bakeTypedefs = bakeTypedefs;
