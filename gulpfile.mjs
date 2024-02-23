/* eslint-disable no-process-env */
'use strict';

import versions from './versions.js';

/* eslint no-console: 0 */
import path from 'path';
import gulp from 'gulp';
import concat from 'gulp-concat';
import sourcemaps from 'gulp-sourcemaps';
import minimist from 'minimist';
import gulpTs from '@ct.js/gulp-typescript';
import {build as esbuild} from 'esbuild';
import stylus from 'gulp-stylus';
import riot from 'gulp-riot';
import pug from 'gulp-pug';
import sprite from 'gulp-svgstore';
import zip from 'gulp-zip';

import stylelint from 'stylelint';
import eslint from 'gulp-eslint';

import streamQueue from 'streamqueue';
import replaceExt from 'gulp-ext-replace';
import notifier from 'node-notifier';
import fs from 'fs-extra';

import spawnise from './node_requires/spawnise/index.js';
import execute from './node_requires/execute.js';
import i18n from './node_requires/i18n/index.js';

import nwBuilderArm from './node_modules/nw-builder-arm/lib/index.cjs';
import nwBuilder from './node_modules/nw-builder/lib/index.cjs';
import resedit from 'resedit-cli';

import {$} from 'execa';

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
const nwVersion = versions.nwjs,
      nwArmVersion = versions.nwjsArm,
      platforms = ['linux32', 'linux64', 'osx64', 'osxarm', 'win32', 'win64'],
      nwFiles = ['./app/**', '!./app/export/**', '!./app/projects/**', '!./app/exportDesktop/**', '!./app/cache/**', '!./app/.vscode/**', '!./app/JamGames/**'];

const argv = minimist(process.argv.slice(2));
const npm = (/^win/).test(process.platform) ? 'npm.cmd' : 'npm';

const pack = fs.readJsonSync('./app/package.json');

var channelPostfix = argv.channel || false,
    fixEnabled = argv.fix || false,
    nightly = argv.nightly || false,
    buildNumber = argv.buildNum || false;
var verbose = argv.verbose || false;

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
        icon: path.join(process.cwd(), 'error.png'),
        sound: true,
        wait: false
    };
};

const fileChangeNotifier = p => {
    notifier.notify({
        title: `Updating ${path.basename(p)}`,
        message: `${p}`,
        icon: path.join(process.cwd(), 'cat.png'),
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
            icon: path.join(process.cwd(), 'error.png'),
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

const tsProject = gulpTs.createProject('tsconfig.json');

const processRequiresTS = () =>
    gulp.src('./src/node_requires/**/*.ts')
    .pipe(sourcemaps.init())
    .pipe(tsProject())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('./app/data/node_requires'));

const processRequires = gulp.series(copyRequires, processRequiresTS);

export const bakeTypedefs = () =>
    gulp.src('./src/typedefs/default/**/*.ts')
    .pipe(concat('global.d.ts'))
    .pipe(gulp.dest('./app/data/typedefs/'));
export const bakeCtTypedefs = () => {
    const tsProject = gulpTs.createProject('./src/ct.release/tsconfig.json');
    return gulp.src('./src/ct.release/index.ts')
        .pipe(tsProject())
        .pipe(gulp.dest('./app/data/typedefs'));
};

const baseEsbuildConfig = {
    entryPoints: ['./src/ct.release/index.ts'],
    bundle: true,
    minify: false,
    legalComments: 'inline'
};
export const buildCtJsLib = () => {
    const processes = [];
    // Ct.js client library for exporter's consumption
    processes.push(esbuild({
        ...baseEsbuildConfig,
        outfile: './app/data/ct.release/ct.js',
        platform: 'browser',
        format: 'iife',
        external: [
            'node_modules/pixi.js',
            'node_modules/pixi-spine',
            'node_modules/@pixi/particle-emitter',
            'node_modules/@pixi/sound'
        ]
    }));
    // Pixi.js dependencies
    processes.push(esbuild({
        ...baseEsbuildConfig,
        entryPoints: ['./src/ct.release/index.pixi.ts'],
        tsconfig: './src/ct.release/tsconfig.json',
        sourcemap: 'linked',
        minify: true,
        outfile: './app/data/ct.release/pixi.js'
    }));
    // Copy other game library's files
    processes.push(gulp.src([
        './src/ct.release/**',
        '!./src/ct.release/*.ts',
        '!./src/ct.release/changes.txt',
        '!./src/ct.release/tsconfig.json'
    ]).pipe(gulp.dest('./app/data/ct.release')));
    return Promise.all(processes);
};
export const buildCtIdeSoundLib = () => esbuild({
    entryPoints: ['./src/ct.release/sounds.ts'],
    outfile: './app/data/ct.shared/ctSound.js',
    bundle: true,
    platform: 'node',
    format: 'cjs',
    treeShaking: true,
    external: [
        'node_modules/pixi.js',
        'node_modules/pixi-spine',
        'node_modules/@pixi/sound'
    ]
});
const watchCtJsLib = () => {
    gulp.watch([
        './src/ct.release/**/*',
        '!./src/ct.release/changes.txt'
    ], buildCtJsLib)
    .on('change', fileChangeNotifier)
    .on('error', err => {
        notifier.notify(makeErrorObj('Ct.js game library failure', err));
        console.error('[Ct.js game library error]', err);
    });

    gulp.watch([
        './src/ct.release/**/*',
        '!./src/ct.release/changes.txt'
    ], buildCtIdeSoundLib);
};

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
    const watcher = gulp.watch('./src/riotTags/**/*.tag', compileRiot);
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
    watchCtJsLib();
    watchIcons();
};

export const lintStylus = () => stylelint.lint({
    files: [
        './src/styl/**/*.styl',
        '!./src/styl/3rdParty/**/*.styl'
    ],
    formatter: 'string'
}).then(lintResults => {
    if (lintResults.errored) {
        console.log(lintResults.output);
    } else {
        console.log('✔ Cheff\'s kiss! 😙👌');
    }
});

export const lintJS = () => gulp.src([
    './src/js/**/*.js',
    '!./src/js/3rdparty/**/*.js',
    './src/node_requires/**/*.js',
    './src/node_requires/**/*.ts',
    './src/ct.release/**/*.ts',
    './src/pug/**/*.pug'
])
.pipe(eslint({
    fix: fixEnabled
}))
.pipe(eslint.format())
.pipe(eslint.failAfterError());

export const lintTags = () => gulp.src(['./src/riotTags/**/*.tag'])
.pipe(replaceExt('.pug')) // rename so that it becomes edible for eslint-plugin-pug
.pipe(eslint()) // ESLint-pug cannot automatically fix issues
.pipe(eslint.format())
.pipe(eslint.failAfterError());

export const lintI18n = () => i18n(verbose).then(console.log);

export const lint = gulp.series(lintJS, lintTags, lintStylus, lintI18n);

const processToPlatformMap = {
    'darwin-x64': 'osx64',
    'darwin-arm64': 'osxarm',
    'win32-x32': 'win32',
    'win32-x64': 'win64',
    'linux-x32': 'linux32',
    'linux-x64': 'linux64'
};
const launchApp = () => {
    const platformKey = `${process.platform}-${process.arch}`;
    const NwBuilder = (platformKey === 'darwin-arm64') ? nwBuilderArm : nwBuilder;
    if (!(platformKey in processToPlatformMap)) {
        throw new Error(`Combination of OS and architecture ${process.platform}-${process.arch} is not supported by NW.js.`);
    }
    const nw = new NwBuilder({
        files: nwFiles,
        version: platformKey === 'darwin-arm64' ? nwArmVersion : nwVersion,
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

export const docs = async () => {
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

export const fetchNeutralino = async () => {
    await $({
        preferLocal: true,
        localDir: './app/node_modules/',
        cwd: './src/ct.release/desktopPack/'
    })`neu update`;
};

export const build = gulp.parallel([
    gulp.series(icons, compilePug),
    compileStylus,
    compileScripts,
    processRequires,
    copyInEditorDocs,
    buildCtJsLib,
    buildCtIdeSoundLib,
    bakeTypedefs,
    bakeCtTypedefs
]);

export const bakePackages = async () => {
    const NwBuilder = nwBuilder;
    // Use the appropriate icon for each release channel
    if (nightly) {
        await fs.copy('./buildAssets/nightly.png', './app/ct_ide.png');
    } else {
        await fs.copy('./buildAssets/icon.png', './app/ct_ide.png');
    }
    await fs.remove(path.join('./build', `ctjs - v${pack.version}`));
    const nw = new NwBuilder({
        files: nwFiles,
        platforms: platforms.filter(x => x !== 'osxarm'),
        version: nwVersion,
        flavor: 'sdk',
        buildType: 'versioned',
        // forceDownload: true,
        zip: false,
        macIcns: nightly ? './buildAssets/nightly.icns' : './buildAssets/icon.icns'
    });
    await nw.build();

    if (platforms.indexOf('osxarm') > -1) {
        try {
            const NwBuilderArm = nwBuilderArm;
            const nwarm = new NwBuilderArm({
                files: nwFiles,
                platforms: ['osxarm'],
                version: nwVersion,
                flavor: 'sdk',
                buildType: 'versioned',
                // forceDownload: true,
                zip: false,
                macIcns: nightly ? './buildAssets/nightly.icns' : './buildAssets/icon.icns'
            });
            await nwarm.build();
        } catch (err) {
            console.error(`
    ╭──────────────────────────────────────────╮
    │                                          ├──╮
    │    Mac OS X (arm64) build failed! D:     │  │
    │                                          │  │
    │  The arm64 architecture on Mac OS X      │  │
    │  relies upon unofficial builds. Thus it  │  │
    │  may not always succeed. Other builds    │  │
    │  will proceed.                           │  │
    │                                          │  │
    ╰─┬────────────────────────────────────────╯  │
    ╰───────────────────────────────────────────╯
    `);
            platforms.splice(platforms.indexOf('osxarm'), 1);
        }
    }

    // Copy .itch.toml files for each target platform
    await Promise.all(platforms.map(platform => {
        if (platform.indexOf('win') === 0) {
            return fs.copy(
                './buildAssets/windows.itch.toml',
                path.join(`./build/ctjs - v${pack.version}`, platform, '.itch.toml')
            );
        }
        if (platform === 'osx64' || platform === 'osxarm') {
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

export const dumpPfx = () => {
    if (!process.env.SIGN_PFX) {
        console.warn('❔ Cannot find PFX certificate in environment variables. Provide it as a local file at ./CoMiGoGames.pfx or set the environment variable SIGN_PFX.');
        return Promise.resolve();
    }
    return fs.writeFile(
        './CoMiGoGames.pfx',
        Buffer.from(process.env.SIGN_PFX, 'base64')
    );
};
const exePatch = {
    icon: [`IDR_MAINFRAME,./buildAssets/${nightly ? 'nightly' : 'icon'}.ico`],
    'product-name': 'ct.js',
    'product-version': pack.version.split('-')[0] + '.0',
    'file-description': 'Ct.js game engine',
    'file-version': pack.version.split('-')[0] + '.0',
    'company-name': 'CoMiGo Games',
    'original-filename': 'ctjs.exe',
    sign: true,
    p12: './CoMiGoGames.pfx'
};
if (process.env.SIGN_PASSWORD) {
    exePatch.password = process.env.SIGN_PASSWORD.replace(/_/g, '');
}
export const patchWindowsExecutables = async () => {
    if (!(await fs.pathExists(exePatch.p12))) {
        console.error('⚠️  Cannot find PFX certificate. Continuing without signing.');
        return;
    }
    if (!process.env.SIGN_PASSWORD) {
        console.error('⚠️  Cannot find PFX password in the SIGN_PASSWORD environment variable. Continuing without signing.');
        return;
    }
    if (platforms.includes('win64')) {
        await resedit({
            in: `./build/ctjs - v${pack.version}/win64/ctjs.exe`,
            out: `./build/ctjs - v${pack.version}/win64/ctjs.exe`,
            ...exePatch
        });
    }
    if (platforms.includes('win32')) {
        await resedit({
            in: `./build/ctjs - v${pack.version}/win32/ctjs.exe`,
            out: `./build/ctjs - v${pack.version}/win32/ctjs.exe`,
            ...exePatch
        });
    }
};

const abortOnWindows = done => {
    if ((/^win/).test(process.platform) && platforms.indexOf('osx64') !== -1) {
        throw new Error('Sorry, but building ct.js for mac is not possible on Windows due to Windows\' specifics. You can edit `platforms` at gulpfile.js if you don\'t need a package for mac.');
    }
    done();
};
export let zipPackages;
if ((/^win/).test(process.platform)) {
    const zipsForAllPlatforms = platforms.map(platform => () =>
        gulp.src(`./build/ctjs - v${pack.version}/${platform}/**`)
        .pipe(zip(`ct.js v${pack.version} for ${platform}.zip`))
        .pipe(gulp.dest(`./build/ctjs - v${pack.version}/`)));
    zipPackages = gulp.parallel(zipsForAllPlatforms);
} else {
    zipPackages = async () => {
        for (const platform of platforms) {
            // eslint-disable-next-line no-await-in-loop
            await execute(({exec}) => exec(`
                cd "./build/ctjs - v${pack.version}/"
                zip -rqy "ct.js v${pack.version} for ${platform}.zip" "./${platform}"
                rm -rf "./${platform}"
            `));
        }
    };
}


const examples = () => gulp.src('./src/examples/**/*')
    .pipe(gulp.dest('./app/examples'));

const templates = () => gulp.src('./src/projectTemplates/**/*')
    .pipe(gulp.dest('./app/templates'));

const gallery = () => gulp.src('./bundledAssets/**/*')
    .pipe(gulp.dest('./app/bundledAssets'));
export const packages = gulp.series([
    lint,
    abortOnWindows,
    gulp.parallel([
        build,
        docs,
        examples,
        fetchNeutralino,
        templates,
        gallery,
        dumpPfx
    ]),
    bakePackages,
    patchWindowsExecutables
]);

/* eslint-disable no-await-in-loop */
export const deployItchOnly = async () => {
    console.log(`For channel ${channelPostfix}`);
    if (!(await fs.pathExists(`./build/ctjs - v${pack.version}/osxarm`))) {
        // No build for OSX ARM
        if (platforms.indexOf('osxarm') !== -1) {
        platforms.splice(platforms.indexOf('osxarm'), 1);
        }
    }
    for (const platform of platforms) {
        if (nightly) {
            await spawnise.spawn('./butler', ['push', `./build/ctjs - v${pack.version}/${platform}`, `comigo/ct-nightly:${platform}${channelPostfix ? '-' + channelPostfix : ''}`, '--userversion', buildNumber]);
        } else {
            await spawnise.spawn('./butler', ['push', `./build/ctjs - v${pack.version}/${platform}`, `comigo/ct:${platform}${channelPostfix ? '-' + channelPostfix : ''}`, '--userversion', pack.version]);
        }
    }
};
/* eslint-enable no-await-in-loop */
export const sendGithubDraft = async () => {
    if (nightly) {
        return; // Do not create github releases for nightlies
    }
    const readySteady = (await import('readysteady')).default;
    const draftData = await readySteady({
        owner: 'ct-js',
        repo: 'ct-js',
        // eslint-disable-next-line id-blacklist
        tag: `v${pack.version}`,
        force: true,
        files: platforms.map(platform => `./build/ctjs - v${pack.version}/ct.js v${pack.version} for ${platform}.zip`)
    });
    console.log(draftData);
};

export const deploy = gulp.series([packages, deployItchOnly, zipPackages, sendGithubDraft]);

const launchDevMode = done => {
    watch();
    launchApp();
    done();
};
const launchDevModeNoNW = done => {
    watch();
    done();
};

export const devNoNW = gulp.series(build, launchDevModeNoNW);
export const nwbuild = bakePackages;
export const dev = devNoNW;

export default gulp.series(build, launchDevMode);
