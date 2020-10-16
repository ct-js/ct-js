export-settings
    h1 {voc.heading}
    fieldset
        label.block.checkbox
            input(type="checkbox" value="{exportSettings.pixelatedrender}" checked="{exportSettings.pixelatedrender}" onchange="{wire('this.exportSettings.pixelatedrender')}")
            span {voc.pixelatedrender}
        label.block.checkbox
            input(type="checkbox" value="{exportSettings.highDensity}" checked="{exportSettings.highDensity}" onchange="{wire('this.exportSettings.highDensity')}")
            span {voc.highDensity}
        label.block.checkbox
            input(type="checkbox" value="{exportSettings.usePixiLegacy}" checked="{exportSettings.usePixiLegacy}" onchange="{wire('this.exportSettings.usePixiLegacy')}")
            span {voc.usePixiLegacy}
    fieldset
        label.block.checkbox
            input(type="checkbox" checked="{exportSettings.hideCursor}" onchange="{wire('this.exportSettings.hideCursor')}")
            span {voc.hideCursor}
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
