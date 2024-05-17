/* eslint-disable no-process-env */
'use strict';

import versions from './versions.js';

/* eslint no-console: 0 */
import path from 'path';
import gulp from 'gulp';
import log from 'gulplog';
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
import eslint from 'gulp-eslint-new';

import streamQueue from 'streamqueue';
import replaceExt from 'gulp-ext-replace';
import notifier from 'node-notifier';
import fs from 'fs-extra';

import spawnise from './node_requires/spawnise/index.js';
import execute from './node_requires/execute.js';
import i18n from './node_requires/i18n/index.js';

import nwBuilder from 'nw-builder';
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
const nwVersion = versions.nwjs;
/**
 * Array of tuples with platform — arch — itch.io channel name in each element.
 * Note how win32 platform is written as just 'win' (that's how nw.js binaries are released).
 */
let platforms = [
    ['linux', 'ia32', 'linux32'],
    ['linux', 'x64', 'linux64'],
    ['osx', 'x64', 'osx64'],
    ['osx', 'arm64', 'osxarm'],
    ['win', 'ia32', 'win32'],
    ['win', 'x64', 'win64']
];
if (process.platform === 'win32') {
    platforms = platforms.filter(p => p[0] !== 'osx');
    log.warn('⚠️  Building packages for MacOS is not supported on Windows. This platform will be skipped.');
}
const nwBuilderOptions = {
    version: nwVersion,
    flavor: 'sdk',
    srcDir: './app/',
    glob: false
};

const argv = minimist(process.argv.slice(2));
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';

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
        console.error('[pug error]', err);
        notifier.notify(makeErrorObj('Pug failure', err));
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
    .pipe(gulp.dest('./temp/'));

const concatScripts = () =>
    streamQueue(
        {
            objectMode: true
        },
        // PIXI.js is used as window.PIXI
        gulp.src('./src/js/exposeGlobalNodeModules.js'),
        gulp.src('./temp/riotTags.js'),
        gulp.src(['./src/js/**', '!./src/js/exposeGlobalNodeModules.js'])
    )
    .pipe(sourcemaps.init({
        largeFile: true
    }))
    .pipe(concat('bundle.js'))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('./temp/'))
    .on('error', err => {
        console.error('[scripts error]', err);
        notifier.notify({
            title: 'Scripts error',
            message: err.toString(),
            icon: path.join(process.cwd(), 'error.png'),
            sound: true,
            wait: true
        });
    })
    .on('change', fileChangeNotifier);


const workerEntryPoints = [
    'vs/language/json/json.worker.js',
    'vs/language/css/css.worker.js',
    'vs/language/html/html.worker.js',
    'vs/language/typescript/ts.worker.js',
    'vs/editor/editor.worker.js'
];
/**
 * Bundles language workers and the editor's worker for monaco-editor.
 * It is needed to be packaged this way to actually work with worker threads.
 * The workers are then linked in src/js/3rdParty/mountMonaco.js
 * @see https://github.com/microsoft/monaco-editor/blob/b400f83fe3ac6a1780b7eed419dc4d83dbf32919/samples/browser-esm-esbuild/build.js
 */
const bundleMonacoWorkers = () => esbuild({
    entryPoints: workerEntryPoints.map((entry) => `node_modules/monaco-editor/esm/${entry}`),
    bundle: true,
    format: 'iife',
    outbase: 'node_modules/monaco-editor/esm/',
    outdir: './app/data/monaco-workers/'
});


const builtinModules = JSON.parse(fs.readFileSync('./builtinModules.json'));
builtinModules.push(...builtinModules.map(m => `node:${m}`));
/**
 * Bundles all the JS scripts into a single bundle.js file.
 * This file is then loaded with a regular <script> in ct.IDE.
 */
const bundleIdeScripts = () => esbuild({
    entryPoints: ['./temp/bundle.js'],
    bundle: true,
    minify: true,
    legalComments: 'inline',
    platform: 'browser',
    format: 'iife',
    outfile: './app/data/bundle.js',
    external: [
        // use node.js built-in modules as is
        ...builtinModules,
        // used by fs-extra? it is needed for electron only
        // and it is not even installed but it breaks if substituted by esbuild
        'original-fs',
        // just breaks when run in a separated context
        'png2icons',
        // Archiver.js breaks when run in a separated context (setImmediate not defined)
        '@neutralinojs/neu',
        // is used for checking if we run ct.js in a dev environment
        // (never is installed into ct.js, gets require-d from a parent directory)
        'gulp',
        // Uses top-level await inside and thus does not support ESBuild's iife format.
        'resedit-cli'
    ],
    sourcemap: true,
    loader: {
        '.ttf': 'file'
    }
});

// Ct.js client library typedefs to be consumed by ct.IDE's code editors.
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
const watchCtJsLib = () => {
    gulp.watch([
        './src/ct.release/**/*',
        '!./src/ct.release/changes.txt'
    ], buildCtJsLib)
    .on('change', fileChangeNotifier)
    .on('error', err => {
        console.error('[Ct.js game library error]', err);
        notifier.notify(makeErrorObj('Ct.js game library failure', err));
    });
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
    gulp.watch('./src/js/**/*', gulp.series(compileScripts, bundleIdeScripts))
    .on('error', err => {
        console.error('[scripts error]', err);
        notifier.notify(makeErrorObj('General scripts error', err));
    })
    .on('change', fileChangeNotifier);
};
const watchRiot = () => {
    const watcher = gulp.watch('./src/riotTags/**/*.tag', compileRiot);
    watcher.on('error', err => {
        console.error('[pug error]', err);
        notifier.notify(makeErrorObj('Riot failure', err));
    });
    watcher.on('change', gulp.series(compileScripts, bundleIdeScripts));
};
const watchStylus = () => {
    gulp.watch('./src/styl/**/*', compileStylus)
    .on('error', err => {
        console.error('[styl error]', err);
        notifier.notify(makeErrorObj('Stylus failure', err));
    })
    .on('change', fileChangeNotifier);
};
const watchPug = () => {
    gulp.watch('./src/pug/**/*.pug', compilePug)
    .on('change', fileChangeNotifier)
    .on('error', err => {
        console.error('[pug error]', err);
        notifier.notify(makeErrorObj('Pug failure', err));
    });
};
const watchRequires = () => {
    gulp.watch('./src/node_requires/**/*', bundleIdeScripts)
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

export const lintTS = () => {
    const tsProject = gulpTs.createProject('tsconfig.json');
    return gulp.src('./src/node_requires/**/*.ts')
        .pipe(tsProject());
};

export const lint = gulp.series(lintJS, lintTS, lintTags, lintStylus, lintI18n);


const launchApp = () => nwBuilder({
    mode: 'run',
    ...nwBuilderOptions,
    arch: process.arch,
    platform: process.platform === 'win32' ? 'win' : process.platform
})
.catch(error => {
    showErrorBox();
    console.error(error);
})
.then(launchApp);

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
    bundleMonacoWorkers,
    gulp.series(icons, compilePug),
    compileStylus,
    gulp.series(
        compileScripts,
        bundleIdeScripts
    ),
    copyInEditorDocs,
    buildCtJsLib,
    bakeTypedefs,
    bakeCtTypedefs
]);

export const bakePackages = async () => {
    // Use the appropriate icon for each release channel
    if (nightly) {
        await fs.copy('./buildAssets/nightly.png', './app/ct_ide.png');
        await fs.writeFile('./app/nightly', '😝');
    } else {
        await fs.copy('./buildAssets/icon.png', './app/ct_ide.png');
        await fs.remove('./app/nightly');
    }
    await fs.remove(path.join('./build', `ctjs - v${pack.version}`));
    const builder = pf => {
        const [platform, arch, itchChannel] = pf;
        log.info(`'bakePackages': Building for ${platform}-${arch}…`);
        return nwBuilder({
            ...nwBuilderOptions,
            mode: 'build',
            platform,
            arch,
            outDir: `./build/ctjs - v${pack.version}/${itchChannel}`,
            zip: false
        });
    };
    // Run first build separately so it fetches manifest.json with all nw.js versions
    // without occasional rewrites and damage.
    await builder(platforms[0]);
    await Promise.all(platforms.slice(1).map(builder));

    // Copy .itch.toml files for each target platform
    log.info('\'bakePackages\': Copying appropriate .itch.toml files to built apps.');
    await Promise.all(platforms.map(pf => {
        const [platform, /* arch */, itchChannel] = pf;
        if (platform === 'win') {
            return fs.copy(
                './buildAssets/windows.itch.toml',
                path.join(`./build/ctjs - v${pack.version}`, itchChannel, '.itch.toml')
            );
        }
        if (platform === 'osx') {
            return fs.copy(
                './buildAssets/mac.itch.toml',
                path.join(`./build/ctjs - v${pack.version}`, itchChannel, '.itch.toml')
            );
        }
        return fs.copy(
            './buildAssets/linux.itch.toml',
            path.join(`./build/ctjs - v${pack.version}`, itchChannel, '.itch.toml')
        );
    }));
    log.info('\'bakePackages\': Built to this location:', path.resolve(path.join('./build', `ctjs - v${pack.version}`)));
};

export const dumpPfx = () => {
    if (!process.env.SIGN_PFX) {
        log.warn('❔ \'dumpPfx\': Cannot find PFX certificate in environment variables. Provide it as a local file at ./CoMiGoGames.pfx or set the environment variable SIGN_PFX.');
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
        log.warn('⚠️  \'patchWindowsExecutables\': Cannot find PFX certificate. Continuing without signing.');
        delete exePatch.p12;
        exePatch.sign = false;
    } else if (!process.env.SIGN_PASSWORD) {
        log.warn('⚠️  \'patchWindowsExecutables\': Cannot find PFX password in the SIGN_PASSWORD environment variable. Continuing without signing.');
        delete exePatch.p12;
        exePatch.sign = false;
    }
    if (platforms.some(p => p[0] === 'win' && p[1] === 'x64')) {
        await resedit({
            in: `./build/ctjs - v${pack.version}/win64/ctjs.exe`,
            out: `./build/ctjs - v${pack.version}/win64/ctjs.exe`,
            ...exePatch
        });
    }
    if (platforms.some(p => p[0] === 'win' && p[1] === 'ia32')) {
        await resedit({
            in: `./build/ctjs - v${pack.version}/win32/ctjs.exe`,
            out: `./build/ctjs - v${pack.version}/win32/ctjs.exe`,
            ...exePatch
        });
    }
};

export let zipPackages;
if (process.platform === 'win32') {
    const zipsForAllPlatforms = platforms.map(platform => () =>
        gulp.src(`./build/ctjs - v${pack.version}/${platform[2]}/**`)
        .pipe(zip(`ct.js v${pack.version} for ${platform[2]}.zip`))
        .pipe(gulp.dest(`./build/ctjs - v${pack.version}/`)));
    zipPackages = gulp.parallel(zipsForAllPlatforms);
} else {
    zipPackages = async () => {
        for (const platform of platforms) {
            // eslint-disable-next-line no-await-in-loop
            await execute(({exec}) => exec(`
                cd "./build/ctjs - v${pack.version}/"
                zip -rqy "ct.js v${pack.version} for ${platform[2]}.zip" "./${platform[2]}"
                rm -rf "./${platform[2]}"
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
    log.info(`'deployItchOnly': Deploying to channel ${channelPostfix}…`);
    for (const platform of platforms) {
        if (nightly) {
            await spawnise.spawn('./butler', [
                'push',
                `./build/ctjs - v${pack.version}/${platform[2]}`,
                `comigo/ct-nightly:${platform[2]}${channelPostfix ? '-' + channelPostfix : ''}`,
                '--userversion',
                buildNumber
            ]);
        } else {
            await spawnise.spawn('./butler', [
                'push',
                `./build/ctjs - v${pack.version}/${platform[2]}`,
                `comigo/ct:${platform[2]}${channelPostfix ? '-' + channelPostfix : ''}`,
                '--userversion',
                pack.version
            ]);
        }
    }
};
/* eslint-enable no-await-in-loop */
export const sendGithubDraft = async () => {
    if (nightly) {
        return; // Do not create github releases for nightlies
    }
    const readySteady = (await import('readysteady')).default;
    const v = pack.version;
    const draftData = await readySteady({
        owner: 'ct-js',
        repo: 'ct-js',
        // eslint-disable-next-line id-blacklist
        tag: `v${pack.version}`,
        force: true,
        files: platforms.map(platform => `./build/ctjs - v${v}/ct.js v${v} for ${platform[2]}.zip`)
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
