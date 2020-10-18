export-settings
    h1 {voc.heading}
    fieldset
        label.block.checkbox
            input(type="checkbox" value="{exportSettings.functionWrap}" checked="{exportSettings.functionWrap}" onchange="{wire('this.exportSettings.functionWrap')}")
            span {voc.functionWrap}
    h2 {voc.codeModifier}
    fieldset
        each key in ['none', 'minify', 'obfuscate']
            label.checkbox
                input(type="radio" value=key checked=`{exportSettings.codeModifier === '${key}'}` onchange="{wire('this.exportSettings.codeModifier')}")
                span=`{voc.codeModifiers.${key}}`

    script.
        this.namespace = 'settings.export';
        this.mixin(window.riotVoc);
        this.mixin(window.riotWired);
        this.currentProject = global.currentProject;
        this.exportSettings = this.currentProject.settings.export;
