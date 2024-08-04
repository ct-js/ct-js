project-settings.aPanel.aView.pad.flexrow
    -
        var tabs = ['main', 'actions', 'branding', 'content', 'modules', 'scripts', 'rendering', 'export'];
        var iconMap = {
            main: 'settings',
            actions: 'airplay',
            branding: 'droplet',
            'content': 'table-sidebar',
            modules: 'ctmod',
            rendering: 'room',
            scripts: 'terminal',
            export: 'package',
            default: 'settings'
        };
    aside.nogrow.noshrink
        ul.aNav.vertical.nbr
            // A bit of Pug sorcery, destroyed by Riot.js syntax
            // Iterate over an array of sections. Template out Riot syntax inside `these` backticks.
            each name in tabs
                li(onclick=`{openTab('${name}')}` class=`{active: tab === '${name}'}` title=`{voc.${name}.heading}` ref=`${name}Tab`)
                    svg.feather
                        use(xlink:href=`#${(name in iconMap)? iconMap[name] : iconMap.default}`)
                    span='{voc.' + name + '.heading}'
        h3(if="{modulesWithFields.length}") {voc.catmodsSettings}
        ul(if="{modulesWithFields.length}").aNav.vertical.nbr
            li(
                each="{module in modulesWithFields}"
                onclick="{openModuleSettings(module)}"
                class="{active: tab === 'moduleSettings' && currentModule === module}"
                title="{module.manifest.main.name}"
            )
                svg.feather
                    use(xlink:href=`#{getIcon(module)}`)
                span {localizeField(module.manifest.main, 'name')}
        h3(if="{currentProject.contentTypes && currentProject.contentTypes.length}") {voc.contentTypes}
        ul(if="{currentProject.contentTypes && currentProject.contentTypes.length}").aNav.vertical.nbr
            li(
                each="{contentType in currentProject.contentTypes}"
                onclick="{openContentType(contentType)}"
                class="{active: tab === 'contentEntriesEditor' && currentContentType === contentType}"
                title="{contentType.readableName || contentType.name || voc.content.missingTypeName}"
            )
                svg.feather
                    use(xlink:href=`#{contentType.icon || 'copy'}`)
                span {contentType.readableName || contentType.name || voc.content.missingTypeName}
    // The .tall class clips its content (overflow: auto), but scripts tab needs to cover space otherwise used for padding of .aPanel class.
    // Disable .tall class for the scripts tab to allow it to be absolutely positioned on the whole panel.
    main.aPanel.relative(class="{tall: tab !== 'scripts'}")
        each name in tabs
            div(if=`{tab === '${name}'}` class="{tall: tab !== 'scripts', relative: tab !== 'scripts'}")
                // This outputs a templated tag name. Magic!
                #{name + '-settings'}
        .pad(if="{tab === 'moduleSettings' && currentModule}")
            h1 {localizeField(currentModule.manifest.main, 'name')}
            extensions-editor(customextends="{currentModule.manifest.fields}" entity="{window.currentProject.libs[currentModule.name]}")
        content-editor(if="{tab === 'contentEntriesEditor' && currentContentType}" contenttype="{currentContentType}")
    script.
        this.namespace = 'settings';
        this.mixin(require('src/lib/riotMixins/voc').default);
        this.mixin(require('src/lib/riotMixins/wire').default);
        this.currentProject = window.currentProject;
        this.currentProject.settings.fps = this.currentProject.settings.fps || 30;

        this.tab = 'main';
        this.openTab = tab => () => {
            if (this.tab === 'content') { // Update type definitions for content types when swutching away from the content tab
                require('src/lib/resources/content')
                    .updateContentTypedefs(window.currentProject);
            }
            this.tab = tab;
            this.currentModule = null;
            this.currentContentType = null;
        };

        const {loadModules, getIcon} = require('src/lib/resources/modules');
        this.getIcon = getIcon;

        this.modulesWithFields = [];
        this.updateModulesWithFields = async () => {
            this.modulesWithFields = (await loadModules())
                .filter(module => module.name in window.currentProject.libs)
                .filter(module => module.manifest.fields);
            this.update();
        };
        this.updateModulesWithFields();
        window.signals.on('modulesChanged', this.updateModulesWithFields);
        this.on('unmount', () => {
            window.signals.off('modulesChanged', this.updateModulesWithFields);
        });

        const contentEditorListener = contentType => {
            this.tab = 'contentEntriesEditor';
            this.currentContentType = contentType;
            this.update();
            require('src/lib/resources/content')
                .updateContentTypedefs(window.currentProject);
        };
        window.orders.on('openContentEntries', contentEditorListener);
        this.on('unmount', () => {
            window.orders.off('openContentEntries', contentEditorListener);
        });
        this.rerender = () => {
            this.update();
        };
        window.signals.on('contentTypeCreated', this.rerender);
        this.on('unmount', () => {
            window.signals.off('contentTypeCreated', this.rerender);
        });

        this.openModuleSettings = module => () => {
            this.currentContentType = null;
            this.currentModule = module;
            this.tab = 'moduleSettings';
        };
        this.openContentType = type => () => {
            this.currentModule = null;
            this.currentContentType = type;
            this.tab = 'contentEntriesEditor';
            require('src/lib/resources/content')
                .updateContentTypedefs(window.currentProject);
        };
