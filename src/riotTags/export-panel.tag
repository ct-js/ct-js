export-panel
    .dim
    .modal.pad.flexfix
        .flexfix-header
            h2.nmt {voc.exportPanel}
        .flexfix-body
            p {voc.firstrunnotice}
            .fifty.npl
                label
                    svg.icon
                        use(xlink:href="data/icons.svg#windows")
                    input(type="checkbox" checked="{currentProject.settings.export.windows64}" onchange="{wire('window.currentProject.settings.export.windows64')}")
                    |   Windows x64
                label
                    svg.icon
                        use(xlink:href="data/icons.svg#windows")
                    input(type="checkbox" checked="{currentProject.settings.export.windows32}" onchange="{wire('window.currentProject.settings.export.windows32')}")
                    |   Windows x32
            .fifty.npr
                label
                    svg.icon
                        use(xlink:href="data/icons.svg#linux")
                    input(type="checkbox" checked="{currentProject.settings.export.linux64}" onchange="{wire('window.currentProject.settings.export.linux64')}")
                    |   Linux x64
                label
                    svg.icon
                        use(xlink:href="data/icons.svg#linux")
                    input(type="checkbox" checked="{currentProject.settings.export.linux32}" onchange="{wire('window.currentProject.settings.export.linux32')}")
                    |   Linux x32
            .clear
            .fifty.npl.npt
                label
                    svg.icon
                        use(xlink:href="data/icons.svg#apple")
                    input(type="checkbox" checked="{currentProject.settings.export.mac64}" onchange="{wire('window.currentProject.settings.export.mac64')}")
                    |   MacOS x64
            .clear
            p
                label
                    input(type="checkbox" checked="{currentProject.settings.export.debug}" onchange="{wire('window.currentProject.settings.export.debug')}")
                    |   {voc.debug}
            h3(if="{log.length}")
                | {voc.log}
                .rem.a(onclick="{copyLog}").toright {vocGlob.copy}
            pre(if="{log.length}")
                div(each="{text in log}") {text.toString()}
        .flexfix-footer
            .flexrow
                button(onclick="{close}") {voc.hide}
                button(onclick="{export}")
                    span.inlineblock.rotateccw(if="{working}")
                        svg.feather
                            use(xlink:href="data/icons.svg#refresh-ccw")
                    svg.feather(if="{!working}")
                        use(xlink:href="data/icons.svg#upload")
                    span(if="{working}")   {voc.working}
                    span(if="{!working}")   {voc.export}
    script.
        this.namespace = 'exportPanel';
        this.mixin(window.riotVoc);
        this.mixin(window.riotWired);
        this.working = false;
        this.log = [];
        currentProject.settings.export = currentProject.settings.export || {};

        const path = require('path'),
              fs = require('fs-extra');

        this.close = function () {
            this.parent.showExporter = false;
            this.parent.update();
        };
        this.export = e => {
            if (this.working) {
                return;
            }
            try {
                const {getWritableDir} = require('./data/node_requires/platformUtils');
                const runCtExport = require('./data/node_requires/exporter');
                let writable;
                this.log = [];
                this.working = true;
                this.update();
                const version = currentProject.settings.version.join('.') + currentProject.settings.versionPostfix;
                runCtExport(currentProject, sessionStorage.projdir)
                .then(getWritableDir)
                .then(dir => writable = dir)
                .then(() => fs.copy('./data/ct.release/desktopPack/', `${writable}/export/`))
                .then(() => {
                    const json = fs.readJSONSync('./data/ct.release/desktopPack/package.json');
                    json.version = version;
                    if (currentProject.settings.title) {
                        json.name = currentProject.settings.title;
                        json.window.title = currentProject.settings.title;
                    }
                    const startingRoom = currentProject.rooms.find(room => room.uid === currentProject.startroom) || currentProject.rooms[0];
                    json.window.width = startingRoom.width;
                    json.window.height = startingRoom.height;
                    return fs.outputJSON(`${writable}/export/package.json`, json);
                })
                .then(() => {
                    const NwBuilder = require('nw-builder');
                    const platforms = [];
                    if (currentProject.settings.export.mac64) {
                        platforms.push('osx64');
                    }
                    if (currentProject.settings.export.windows64) {
                        platforms.push('win64');
                    }
                    if (currentProject.settings.export.windows32) {
                        platforms.push('win32');
                    }
                    if (currentProject.settings.export.linux64) {
                        platforms.push('linux64');
                    }
                    if (currentProject.settings.export.linux32) {
                        platforms.push('linux32');
                    }
                    const options = {
                        files: `${writable}/export/**/**`, // use the glob format
                        version: '0.34.1',
                        platforms,
                        flavor: (currentProject.settings.export.debug? 'sdk' : 'normal'),
                        appName: currentProject.settings.title || 'ct.js Game',
                        buildDir: `${writable}/exportDesktop`,
                        buildType: 'versioned',
                        macIcns: './ct.ide.icns'
                    };
                    if (process.platform === 'win32') {
                        options.winIco = './ct.ide.ico';
                        if (currentProject.settings.author) {
                            options.winVersionString = {
                                CompanyName: currentProject.settings.author,
                                FileDescription: currentProject.settings.title || 'ct.js Game',
                                ProductName: currentProject.settings.title || 'ct.js Game',
                                LegalCopyright: `Copyright ${(new Date()).getFullYear()}`,
                            }
                        }
                    }
                    this.builder = new NwBuilder(options);
                    this.builder.on('log', log => {
                        this.log.push(log);
                        this.update();
                    })
                    .on('error', err => {
                        console.error(err);
                        this.log.push(err);
                        this.update();
                    });
                    return this.builder.build();
                })
                .then(() => {
                    this.log.push('Success! Exported to:');
                    alertify.success(`Success! Exported to: ${writable}/exportDesktop/`);
                    this.log.push(path.resolve(`${writable}/exportDesktop/`));
                    this.working = false;
                    const {shell} = require('electron');
                    shell.showItemInFolder(path.resolve(`./exportDesktop/${currentProject.settings.title || 'ctjs-game'} - v${version}`));
                    this.update();
                })
                .catch(error => {
                    this.log.push(error);
                    alertify.error(error);
                    console.error(error);
                    this.working = false;
                    this.update();
                });
            } catch (e) {
                this.log.push(error);
                this.update();
                alertify.error(error);
                throw (e);
            }
        };

        this.copyLog = e => {
            const {clipboard} = require('electron');
            clipboard.writeText(this.log.join('\n'));
        };