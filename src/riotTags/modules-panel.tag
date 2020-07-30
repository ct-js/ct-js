modules-panel.panel.view
    .flexrow.tall
        .c3.borderright.tall
            ul#moduleincluded
                li(each="{module in enabledModules}" onclick="{renderModule(module)}")
                    svg.feather.success
                        use(xlink:href="data/icons.svg#check")
                    span {module}
            ul#modulelist
                li(each="{module in allModules}" onclick="{renderModule(module)}")
                    svg.feather(class="{(module in global.currentProject.libs)? 'success on' : 'off'}")
                        use(xlink:href="data/icons.svg#{(module in global.currentProject.libs)? 'check' : 'ctmod'}")
                    span {module}
            label.file.flexfix-footer.nmb
                input(
                    type="file"
                    ref="importmodules"
                    accept=".zip"
                    onchange="{importModules}")
                .button.wide.inline.nml.nmr
                    svg.feather
                        use(xlink:href="data/icons.svg#folder")
                    span {voc.importModules}
        .c9.tall.flexfix(if="{currentModule}")
            ul.nav.tabs.flexfix-header.noshrink
                li#modinfo(onclick="{changeTab('moduleinfo')}" class="{active: tab === 'moduleinfo'}")
                    svg.feather
                        use(xlink:href="data/icons.svg#info")
                    span {voc.info}
                li#modsettings(if="{currentModule.fields && currentModuleName in global.currentProject.libs}" onclick="{changeTab('modulesettings')}" class="{active: tab === 'modulesettings'}")
                    svg.feather
                        use(xlink:href="data/icons.svg#settings")
                    span {voc.settings}
                li#modhelp( if="{currentModuleDocs}" onclick="{changeTab('modulehelp')}" class="{active: tab === 'modulehelp'}")
                    svg.feather
                        use(xlink:href="data/icons.svg#file-text")
                    span {voc.help}
                li#modlogs(if="{currentModuleLogs}" onclick="{changeTab('modulelogs')}" class="{active: tab === 'modulelogs'}")
                    svg.feather
                        use(xlink:href="data/icons.svg#list")
                    span {voc.logs}
            div.flexfix-body
                #moduleinfo.tabbed.nbt(show="{tab === 'moduleinfo'}")
                    label.bigpower(onclick="{toggleModule(currentModuleName)}" class="{off: !(currentModuleName in global.currentProject.libs)}")
                        svg.feather
                            use(xlink:href="data/icons.svg#{currentModuleName in global.currentProject.libs? 'check' : 'x'}")
                        span
                    h1#modname
                        span {currentModule.main.name}
                        span.version {currentModule.main.version}
                    a.external(each="{author in currentModule.main.authors}" title="{voc.author}" href="{author.site || 'mailto:'+author.mail}")
                        svg.feather
                            use(xlink:href="data/icons.svg#user")
                        span#modauthor {author.name}

                    span(title="{voc.hasinjects}" show="{currentModule.injects}")
                        svg.feather.warning#modinjects
                            use(xlink:href="data/icons.svg#zap")
                    span(title="{voc.hasfields}" show="{currentModule.fields}")
                        svg.feather.success
                            use(xlink:href="data/icons.svg#settings")
                    span(title="{voc.hasinputmethods}" show="{currentModule.inputMethods}")
                        svg.feather.success
                            use(xlink:href="data/icons.svg#airplay")

                    div(if="{currentModule.dependencies && currentModule.dependencies.length}")
                        .spacer
                        b {voc.dependencies}
                        .inlineblock(each="{dependency in currentModule.dependencies}")
                            svg.feather(if="{dependency in global.currentProject.libs}").success
                                use(xlink:href="data/icons.svg#check")
                            svg.feather(if="{!(dependency in global.currentProject.libs)}").error
                                use(xlink:href="data/icons.svg#alert-circle")
                            span   {dependency}

                    div(if="{currentModule.optionalDependencies && currentModule.optionalDependencies.length}")
                        .spacer
                        b {voc.optionalDependencies}
                        .inlineblock(each="{dependency in currentModule.optionalDependencies}")
                            svg.feather(if="{dependency in global.currentProject.libs}").success
                                use(xlink:href="data/icons.svg#check")
                            svg.feather(if="{!(dependency in global.currentProject.libs)}").warning
                                use(xlink:href="data/icons.svg#alert-triangle")
                            span   {dependency}

                    #modinfohtml(if="{currentModuleHelp}")
                        raw(ref="raw" content="{currentModuleHelp}")
                    h1(if="{currentModuleLicense}") {voc.license}
                    pre(if="{currentModuleLicense}")
                        code {currentModuleLicense}

                #modulesettings.tabbed.nbt(show="{tab === 'modulesettings'}" if="{currentModule.fields && currentModuleName in global.currentProject.libs}")
                    extensions-editor(customextends="{currentModule.fields}" entity="{global.currentProject.libs[currentModuleName]}")
                #modulehelp.tabbed.nbt(show="{tab === 'modulehelp'}" if="{currentModuleDocs}")
                    raw(ref="raw" content="{currentModuleDocs}")
                #modulelogs.tabbed.nbt(show="{tab === 'modulelogs'}" if="{currentModuleLogs}")
                    h1 {voc.logs2}
                    raw(ref="raw" content="{currentModuleLogs}")

    script.
        const path = require('path'),
              fs = require('fs-extra'),
              unzipper = require('unzipper');
        const md = require('markdown-it')({
            html: false,
            linkify: true,
            highlight: function highlight(str, lang) {
                const hljs = require('highlight.js');
                if (lang && hljs.getLanguage(lang)) {
                    try {
                        return hljs.highlight(lang, str).value;
                    } catch (oO) {
                        void 0;
                    }
                }
                return ''; // use external default escaping
            }
        });
        const glob = require('./data/node_requires/glob');
        const libsDir = './data/ct.libs';
        this.md = md;
        this.mixin(window.riotWired);
        this.namespace = 'modules';
        this.mixin(window.riotVoc);

        this.currentModule = false;
        this.currentModuleHelp = '';
        this.currentModuleDocs = '';
        this.currentModuleLicense = '';

        this.tab = 'moduleinfo';
        this.changeTab = tab => () => {
            this.tab = tab;
        };

        this.allModules = [];
        this.on('update', () => {
            this.enabledModules = [];
            for (const i in global.currentProject.libs) {
                this.enabledModules.push(i);
            }
        });

        this.escapeDots = str => str.replace(/\./g, '\\.');

        const tryLoadTypedefs = moduleName => {
            if (!(moduleName in global.currentProject.libs)) {
                return;
            }
            const typedefPath = path.join(libsDir, moduleName, 'types.d.ts');
            fs.pathExists(typedefPath)
            .then(exists => {
                const ts = monaco.languages.typescript;
                if (!exists) {
                    // generate dummy typedefs if none were provided by the module
                    const catmodTypedefs = `declare namespace ct {\n/** Sorry, no in-code docs for this module :c */\n var ${moduleName}: any; }`;
                    glob.moduleTypings[moduleName] = [
                        ts.javascriptDefaults.addExtraLib(catmodTypedefs),
                        ts.typescriptDefaults.addExtraLib(catmodTypedefs)
                    ];
                    return;
                }
                fs.readFile(typedefPath, 'utf8')
                .then(catmodTypedefs => {
                    glob.moduleTypings[moduleName] = [
                        ts.javascriptDefaults.addExtraLib(catmodTypedefs),
                        ts.typescriptDefaults.addExtraLib(catmodTypedefs)
                    ];
                });
            });
        };
        const removeTypedefs = moduleName => {
            if (glob.moduleTypings[moduleName]) {
                for (const lib of glob.moduleTypings[moduleName]) {
                    lib.dispose();
                }
            }
        };
        fs.readdir(libsDir, (err, files) => {
            if (err) {
                throw err;
            }
            for (var i = 0; i < files.length; i++) {
                if (fs.pathExistsSync(path.join(libsDir, files[i], 'module.json'))) {
                    const moduleName = files[i];
                    this.allModules.push(moduleName);
                    tryLoadTypedefs(moduleName);
                }
            }
            this.currentModuleHelp = '';
            this.currentModuleDocs = '';
            this.currentModuleLicense = '';
            this.renderModule(this.allModules[0])();
            this.update();
        });

        const addDefaults = moduleName => {
            for (const field of this.currentModule.fields) {
                if (!global.currentProject.libs[moduleName][field.key]) {
                    if (field.default) {
                        global.currentProject.libs[moduleName][field.key] = field.default;
                    } else if (field.type === 'number') {
                        global.currentProject.libs[moduleName][field.key] = 0;
                    } else if (field.type === 'checkbox') {
                        global.currentProject.libs[moduleName][field.key] = false;
                    } else {
                        global.currentProject.libs[moduleName][field.key] = '';
                    }
                }
            }
        };

        this.toggleModule = moduleName => e => {
            if (global.currentProject.libs[moduleName]) {
                delete global.currentProject.libs[moduleName];
                removeTypedefs(moduleName);
            } else {
                global.currentProject.libs[moduleName] = {};
                tryLoadTypedefs(moduleName);
                // 'Settings' page
                if (this.currentModule.fields) {
                    addDefaults(moduleName);
                }
            }
            this.renderModule(moduleName)(e);
            window.signals.trigger('modulesChanged');
            glob.modified = true;
        };
        this.renderModule = name => () => {
            fs.readJSON(path.join(libsDir, name, 'module.json'), (err, catmod) => {
                if (err) {
                    alertify.error(err);
                    if (name in global.currentProject.libs) {
                        delete global.currentProject.libs[name];
                    }
                    this.currentModule = false;
                    this.update();
                    return;
                }
                this.currentModule = catmod;
                this.currentModuleName = name;

                if (fs.pathExistsSync(path.join(libsDir, name, 'README.md'))) {
                    this.currentModuleHelp = md.render(fs.readFileSync(path.join(libsDir, name, 'README.md'), {
                        encoding: 'utf8'
                    }) || '');
                } else {
                    this.currentModuleHelp = false;
                }
                if (fs.pathExistsSync(path.join(libsDir, name, 'DOCS.md'))) {
                    this.currentModuleDocs = md.render(fs.readFileSync(path.join(libsDir, name, 'DOCS.md'), {
                        encoding: 'utf8'
                    }) || '');
                } else {
                    this.currentModuleDocs = false;
                }
                if (fs.pathExistsSync(path.join(libsDir, name, 'CHANGELOG.md'))) {
                    this.currentModuleLogs = md.render(fs.readFileSync(path.join(libsDir, name, 'CHANGELOG.md'), {
                        encoding: 'utf8'
                    }) || '');
                } else {
                    this.currentModuleLogs = false;
                }
                if (fs.pathExistsSync(path.join(libsDir, name, 'LICENSE'))) {
                    this.currentModuleLicense = fs.readFileSync(path.join(libsDir, name, 'LICENSE'), {
                        encoding: 'utf8'
                    }) || '';
                } else {
                    this.currentModuleLicense = false;
                }
                this.currentModule.injects = fs.pathExistsSync(path.join(libsDir, name, 'injects'));
                this.update();
            });
            this.tab = 'moduleinfo';
        };

        this.importModules = e => {
            const {files} = e.target;
            if (files.length === 0) {
                return;
            }
            const value = files[0].path;
            e.target.value = '';
            let parentName = null;
            let moduleName = null;
            const entries = [];
            fs.createReadStream(value)
            .pipe(unzipper.Parse())
            .on('entry', async entry => {
                const fileName = entry.path.toLowerCase();
                if (path.basename(fileName) === 'module.json') {
                    // consume the entry by buffering the contents into memory.
                    // eslint-disable-next-line require-atomic-updates
                    const content = entry.tmpContent = await entry.buffer();
                    const json = JSON.parse(content.toString());
                    moduleName = json.main.packageName || path.basename(value, '.zip');
                    const indexOf = fileName.indexOf('/');
                    if (indexOf !== -1) {
                        parentName = fileName.substring(0, indexOf);
                    }
                }
                entries.push(entry);
            })
            .on('finish', async () => {
                if (moduleName !== null) {
                    // create a parent directory
                    await fs.ensureDir(path.join(libsDir, moduleName));
                    for (const entry of entries) {
                        const filePath = entry.path;
                        const indexOf = filePath.indexOf('/');
                        if (filePath === parentName) {
                            continue;
                        }
                        if (indexOf !== -1) {
                            if (parentName !== null) {
                                entry.path = `${moduleName}${filePath.substring(indexOf)}`;
                            } else {
                                entry.path = `${moduleName}/${filePath}`;
                            }
                        } else {
                            entry.path = `${moduleName}/${filePath}`;
                        }
                        entry.path = path.join(libsDir, entry.path);
                         // 'Directory' or 'File'
                        if (entry.type === 'Directory') {
                            // eslint-disable-next-line no-await-in-loop
                            await fs.ensureDir(entry.path);
                        } else {
                            const fileName = entry.path.toLowerCase();
                            if (fileName.endsWith('module.json')) {
                                const content = entry.tmpContent;
                                // eslint-disable-next-line no-await-in-loop
                                await fs.writeFile(entry.path, content);
                            } else {
                                entry.pipe(fs.createWriteStream(entry.path))
                                .on('error', (e) => {
                                    alertify.error(e);
                                    console.error(e);
                                });
                            }
                        }
                    }
                    this.allModules.push(moduleName);
                    this.update();
                }
            });
        };
