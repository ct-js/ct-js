branding-settings
    h1 {voc.heading}
    b
        span {voc.icon}
        hover-hint(text="{voc.iconNotice}")
    br
    asset-input(
        assettypes="texture"
        assetid="{window.currentProject.settings.branding.icon || -1}"
        allowclear="yep"
        onchanged="{updateGameIcon}"
        header="{voc.icon}"
    )
    .aSpacer
    b
        span {voc.splashScreen}
        hover-hint(text="{voc.splashScreenNotice}")
    br
    asset-input(
        assettypes="texture"
        assetid="{window.currentProject.settings.branding.splashScreen || -1}"
        allowclear="yep"
        onchanged="{updateGameSplashScreen}"
        header="{voc.splashScreen}"
    )
    .aSpacer
    label.block.checkbox
        input(
            type="checkbox"
            checked="{window.currentProject.settings.branding.forceSmoothIcons}"
            onchange="{wire('currentProject.settings.branding.forceSmoothIcons')}"
        )
        span {voc.forceSmoothIcons}
    label.block.checkbox
        input(
            type="checkbox"
            checked="{window.currentProject.settings.branding.forceSmoothSplashScreen}"
            onchange="{wire('currentProject.settings.branding.forceSmoothSplashScreen')}"
        )
        span {voc.forceSmoothSplashScreen}
    .aSpacer
    b
        span {voc.accent}
        hover-hint(text="{voc.accentNotice}")
    color-input(onchange="{wire('currentProject.settings.branding.accent', true)}" color="{window.currentProject.settings.branding.accent}")
    .aSpacer
    label.block.checkbox
        input(
            type="checkbox"
            checked="{window.currentProject.settings.branding.invertPreloaderScheme}"
            onchange="{wire('currentProject.settings.branding.invertPreloaderScheme')}"
        )
        span {voc.invertPreloaderScheme}
    label.block.checkbox
        input(
            type="checkbox"
            checked="{window.currentProject.settings.branding.hideLoadingLogo}"
            onchange="{wire('currentProject.settings.branding.hideLoadingLogo')}"
        )
        span {voc.hideLoadingLogo}
    label.block.checkbox
        input(
            type="checkbox"
            checked="{window.currentProject.settings.branding.alternativeLogo}"
            onchange="{wire('currentProject.settings.branding.alternativeLogo')}"
        )
        span {voc.alternativeCtjsLogo}
        hover-hint(text="{voc.alternativeCtjsNotice}")
    label.block
        span {voc.customLoadingText}
        hover-hint(text="{voc.customLoadingTextHint}")
        br
        input(
            type="text"
            value="{window.currentProject.settings.branding.customLoadingText}"
            onchange="{wire('currentProject.settings.branding.customLoadingText')}"
        )

    script.
        this.namespace = 'settings.branding';
        this.mixin(require('src/node_requires/riotMixins/voc').default);
        this.mixin(require('src/node_requires/riotMixins/wire').default);
        this.currentProject = window.currentProject;

        this.updateGameIcon = id => {
            window.currentProject.settings.branding.icon = id;
        };
        this.updateGameSplashScreen = id => {
            window.currentProject.settings.branding.splashScreen = id;
        };
